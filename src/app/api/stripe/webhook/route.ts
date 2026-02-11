import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

// Use service role key — webhook requests have no user session
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    periodStart: new Date(item.current_period_start * 1000).toISOString(),
    periodEnd: new Date(item.current_period_end * 1000).toISOString(),
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    // Still return 200 to prevent Stripe retries on processing errors
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const loungeId = session.metadata?.lounge_id;
  const planId = session.metadata?.plan_id;
  const userId = session.metadata?.supabase_user_id;
  const stripeSubscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;

  if (!loungeId || !planId || !stripeSubscriptionId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription details from Stripe for period dates
  const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
  const { periodStart, periodEnd } = getSubscriptionPeriod(subscription);

  // Upsert subscription record (idempotent for duplicate webhooks)
  await getSupabaseAdmin()
    .from('subscriptions')
    .upsert(
      {
        lounge_id: loungeId,
        plan_id: planId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
      },
      { onConflict: 'stripe_subscription_id' }
    );

  // Update lounge subscription status
  await getSupabaseAdmin()
    .from('lounges')
    .update({
      subscription_plan_id: planId,
      subscription_status: 'active',
      subscription_ends_at: periodEnd,
    })
    .eq('id', loungeId);

  // Ensure stripe_customer_id is saved on profile
  if (userId && stripeCustomerId) {
    await getSupabaseAdmin()
      .from('profiles')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const loungeId = subscription.metadata?.lounge_id;
  const planId = subscription.metadata?.plan_id;
  const stripeSubscriptionId = subscription.id;

  if (!loungeId) {
    console.error('Missing lounge_id in subscription metadata');
    return;
  }

  const { periodStart, periodEnd } = getSubscriptionPeriod(subscription);

  // Map Stripe status to our status
  let status: 'active' | 'canceled' | 'past_due' = 'active';
  if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    status = 'past_due';
  } else if (subscription.status === 'canceled') {
    status = 'canceled';
  }

  // Update subscription record
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
    })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  // Update lounge — keep 'active' if cancel_at_period_end (user paid for the period)
  const loungeStatus = subscription.cancel_at_period_end ? 'active' : status;

  await getSupabaseAdmin()
    .from('lounges')
    .update({
      subscription_status: loungeStatus,
      subscription_ends_at: periodEnd,
      ...(planId ? { subscription_plan_id: planId } : {}),
    })
    .eq('id', loungeId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const loungeId = subscription.metadata?.lounge_id;
  const stripeSubscriptionId = subscription.id;

  if (!loungeId) {
    console.error('Missing lounge_id in subscription metadata');
    return;
  }

  // Update subscription record
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  // Clear lounge subscription
  await getSupabaseAdmin()
    .from('lounges')
    .update({
      subscription_status: 'canceled',
      subscription_plan_id: null,
      subscription_ends_at: null,
    })
    .eq('id', loungeId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // In Stripe SDK v20, subscription is nested under parent.subscription_details
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const stripeSubscriptionId = typeof subscriptionRef === 'string'
    ? subscriptionRef
    : subscriptionRef?.id;

  if (!stripeSubscriptionId) return;

  // Find the subscription in our DB
  const { data: sub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('lounge_id, id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!sub) return;

  // Update lounge status to past_due
  await getSupabaseAdmin()
    .from('lounges')
    .update({ subscription_status: 'past_due' })
    .eq('id', sub.lounge_id);

  // Record the failed payment
  await getSupabaseAdmin()
    .from('payments')
    .insert({
      lounge_id: sub.lounge_id,
      subscription_id: sub.id,
      amount: invoice.amount_due,
      status: 'failed',
    });
}
