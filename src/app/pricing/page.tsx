'use client';

import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, Crown, ArrowRight } from 'lucide-react';

export default function Pricing() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            Pricing Plans
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your lounge. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Free Listing */}
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-1">Free Listing</h4>
                <p className="text-3xl font-bold text-primary mb-4">
                  $0<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">Get listed</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Business name & address
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Contact info (phone, website)
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Lounge type & basic amenities
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Appear in search results
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login?tab=signup&redirectTo=/onboarding">
                    Get Started Free
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Listing */}
            <Card className="border-primary/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Pro Listing
                </h4>
                <p className="text-3xl font-bold text-primary mb-4">
                  $49<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">Look professional</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Everything in Free
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Verified badge
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Full description & photos (up to 10)
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Hours of operation
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Social media links
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Event promotion
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/login?tab=signup&redirectTo=/onboarding">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Listing */}
            <Card className="border-purple-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Best Value
                </span>
              </div>
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Premium Listing
                </h4>
                <p className="text-3xl font-bold text-primary mb-4">
                  $99<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">Grow your business</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Everything in Pro
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Featured on homepage
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Highlighted in search results
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Professional website
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    Analytics dashboard
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    AI social post generator
                  </li>
                </ul>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/login?tab=signup&redirectTo=/onboarding">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Already have an account?
            </p>
            <Button asChild variant="link" className="text-primary">
              <Link href="/login?redirectTo=/onboarding">
                Sign in to manage your listing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
