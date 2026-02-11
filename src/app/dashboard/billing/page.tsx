'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Check,
  CreditCard,
  Zap,
  Star,
  Crown,
  Sparkles,
  Globe,
  BarChart3,
  MessageSquare,
  Calendar,
  TrendingUp,
  Rocket,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function Billing() {
  const { user } = useAuth();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const upgradeParam = searchParams.get('upgrade');
  const successParam = searchParams.get('success');
  const canceledParam = searchParams.get('canceled');

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showLoungeSelector, setShowLoungeSelector] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<string | null>(null);

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's lounges with subscription status
  const { data: lounges, isLoading: loungesLoading } = useQuery({
    queryKey: ['owner-lounges-billing', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('lounges')
        .select('*, subscription_plans(name)')
        .eq('owner_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const startCheckout = async (planId: string, loungeId: string) => {
    const plan = plans?.find(p => p.id === planId);
    if (!plan) return;

    const priceId = billingInterval === 'yearly'
      ? plan.stripe_price_id_yearly
      : plan.stripe_price_id_monthly;

    if (!priceId) {
      toast.error('This plan is not yet available for purchase.');
      return;
    }

    setCheckoutLoading(loungeId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, loungeId, planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSubscribe = (planId: string) => {
    if (!lounges || lounges.length === 0) {
      toast.error('You need to add a lounge first before subscribing.');
      return;
    }

    if (lounges.length === 1) {
      startCheckout(planId, lounges[0].id);
    } else {
      setSelectedPlanForCheckout(planId);
      setShowLoungeSelector(true);
    }
  };

  const handleUpgradeLounge = (planId: string, loungeId: string) => {
    startCheckout(planId, loungeId);
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setPortalLoading(false);
    }
  };

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Star className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'basic':
        return 'bg-stone-100 text-stone-600';
      case 'pro':
        return 'bg-amber-100 text-amber-600';
      case 'premium':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-stone-100 text-stone-600';
    }
  };

  const isLoading = plansLoading || loungesLoading;

  // Premium features for the hero section
  const premiumFeatures = [
    { icon: Sparkles, title: 'AI Social Post Generator', description: 'Create engaging social media posts with AI' },
    { icon: Calendar, title: 'AI Event Descriptions', description: 'Generate compelling event copy automatically' },
    { icon: Globe, title: 'Professional Website', description: 'Custom website for your business' },
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Track visitors, engagement, and trends' },
    { icon: MessageSquare, title: 'Direct Messaging', description: 'Connect with customers directly' },
    { icon: TrendingUp, title: 'Featured Placement', description: 'Top placement on homepage and search' },
  ];

  // Invalidate queries on success to show fresh data
  if (successParam) {
    queryClient.invalidateQueries({ queryKey: ['owner-lounges-billing'] });
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {successParam && (
        <Alert className="border-green-500 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Subscription Active!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your subscription is now active. Your lounge has been upgraded with all plan features.
          </AlertDescription>
        </Alert>
      )}

      {/* Canceled Alert */}
      {canceledParam && (
        <Alert className="border-stone-300 bg-stone-50">
          <CreditCard className="h-4 w-4 text-stone-600" />
          <AlertTitle className="text-stone-800">Checkout Canceled</AlertTitle>
          <AlertDescription className="text-stone-700">
            No worries! You can subscribe anytime you&apos;re ready.
          </AlertDescription>
        </Alert>
      )}

      {/* Upgrade Alert from Onboarding */}
      {upgradeParam && !successParam && (
        <Alert className="border-amber-500 bg-amber-50">
          <Rocket className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Complete Your Setup</AlertTitle>
          <AlertDescription className="text-amber-700">
            You selected the {upgradeParam === 'premium' ? 'Premium' : 'Pro'} plan during onboarding.
            Subscribe below to activate all features!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Upgrade your listings for better visibility and features
          </p>
        </div>
        {lounges?.some((l: any) => l.subscription_status === 'active') && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Manage Billing
          </Button>
        )}
      </div>

      {/* Premium Features Hero */}
      <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            <CardTitle className="text-white">Unlock Premium Features</CardTitle>
          </div>
          <CardDescription className="text-purple-100">
            Grow your business with AI-powered tools and premium visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {premiumFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-purple-200">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Subscriptions */}
      {lounges && lounges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Lounges</CardTitle>
            <CardDescription>Manage subscriptions for your lounges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lounges.map((lounge: any) => (
                <div
                  key={lounge.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{lounge.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lounge.subscription_status === 'active' ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="h-3 w-3" />
                          {lounge.subscription_plans?.name || 'Active'} Plan
                          {lounge.subscription_ends_at && (
                            <span className="text-muted-foreground ml-1">
                              &middot; Renews {new Date(lounge.subscription_ends_at).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      ) : lounge.subscription_status === 'past_due' ? (
                        <span className="text-amber-600">Payment past due</span>
                      ) : (
                        'No active subscription'
                      )}
                    </p>
                  </div>
                  {lounge.subscription_status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Manage'
                      )}
                    </Button>
                  ) : lounge.subscription_status === 'past_due' ? (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                    >
                      Update Payment
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Yearly <span className="text-green-600 text-xs">Save 17%</span>
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const isPro = plan.slug === 'pro';
              const isPremium = plan.slug === 'premium';
              const isHighlighted = isPro || (upgradeParam === plan.slug);
              const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
              const perMonth = billingInterval === 'yearly'
                ? Math.round(plan.price_yearly / 12)
                : plan.price_monthly;

              return (
                <Card
                  key={plan.id}
                  className={isHighlighted ? 'border-amber-500 border-2 relative' : isPremium ? 'border-purple-500 border-2 relative' : ''}
                >
                  {isPro && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600">
                      Most Popular
                    </Badge>
                  )}
                  {isPremium && !isPro && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
                      Best Value
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPlanColor(plan.slug)}`}>
                        {getPlanIcon(plan.slug)}
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">{formatPrice(perMonth)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingInterval === 'yearly' && (
                      <p className="text-sm text-muted-foreground">
                        Billed {formatPrice(price)}/year
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {Array.isArray(plan.features) &&
                        plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature as string}</span>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.slug === 'basic' ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${
                          isPro
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={checkoutLoading !== null}
                      >
                        {checkoutLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Get Started
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-4 text-lg font-medium">No plans available</h3>
              <p className="text-muted-foreground">
                Subscription plans are being configured. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">What happens when I upgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Your lounge will immediately receive the benefits of your new plan, including
              featured placement and the verified badge.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your benefits will continue until
              the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Do you offer refunds?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 14-day money-back guarantee if you&apos;re not satisfied with your subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lounge Selector Dialog */}
      <Dialog open={showLoungeSelector} onOpenChange={setShowLoungeSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Lounge</DialogTitle>
            <DialogDescription>
              Choose which lounge you&apos;d like to upgrade.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {lounges?.filter((l: any) => l.subscription_status !== 'active').map((lounge: any) => (
              <button
                key={lounge.id}
                onClick={() => {
                  setShowLoungeSelector(false);
                  if (selectedPlanForCheckout) {
                    startCheckout(selectedPlanForCheckout, lounge.id);
                  }
                }}
                disabled={checkoutLoading !== null}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors text-left"
              >
                <div>
                  <h3 className="font-medium">{lounge.name}</h3>
                  <p className="text-sm text-muted-foreground">{lounge.address}</p>
                </div>
                {checkoutLoading === lounge.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-sm text-primary font-medium">Select</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
