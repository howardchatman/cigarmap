'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Users,
  Rocket,
} from 'lucide-react';

export default function Billing() {
  const { user } = useAuth();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get('upgrade');

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
        .eq('owner_id', user.id)
        .eq('status', 'approved');
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

  const handleSubscribe = (planId: string, loungeId?: string) => {
    // This would integrate with Stripe Checkout
    toast.info('Stripe checkout coming soon! Contact us to subscribe.');
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

  return (
    <div className="space-y-6">
      {/* Upgrade Alert from Onboarding */}
      {upgradeParam && (
        <Alert className="border-amber-500 bg-amber-50">
          <Rocket className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Complete Your Website Setup</AlertTitle>
          <AlertDescription className="text-amber-700">
            You selected the {upgradeParam === 'premium' ? 'Premium' : 'Pro'} plan during onboarding.
            Subscribe below to activate your professional website and all premium features!
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Upgrade your listings for better visibility and features
        </p>
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
            <CardTitle>Your Active Subscriptions</CardTitle>
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
                        </span>
                      ) : (
                        'No active subscription'
                      )}
                    </p>
                  </div>
                  {lounge.subscription_status === 'active' ? (
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => handleSubscribe('', lounge.id)}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
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
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={index === 1 ? 'border-amber-500 border-2 relative' : ''}
              >
                {index === 1 && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600">
                    Most Popular
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
                    <span className="text-3xl font-bold">{formatPrice(plan.price_monthly)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    or {formatPrice(plan.price_yearly)}/year (save 17%)
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature as string}</span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      index === 1
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-stone-800 hover:bg-stone-900'
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
              We offer a 14-day money-back guarantee if you're not satisfied with your subscription.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
