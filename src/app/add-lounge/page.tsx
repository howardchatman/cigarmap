'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, ArrowRight, Loader2, Store, Shield, TrendingUp } from 'lucide-react';

export default function AddLounge() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  // If user is logged in and has completed onboarding, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user && profile?.onboarding_completed) {
      router.replace('/dashboard');
    }
  }, [user, profile, isLoading, router]);

  // If user is logged in but hasn't completed onboarding, redirect to onboarding
  useEffect(() => {
    if (!isLoading && user && !profile?.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [user, profile, isLoading, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            List Your Cigar Lounge
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
            Join CigarMap and connect with cigar enthusiasts looking for great lounges in their area
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* CTA Card */}
            <Card className="mb-12 border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <Store className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your free account to list your lounge on CigarMap. It only takes a few minutes to set up your profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/signup?redirectTo=/onboarding">
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login?redirectTo=/onboarding">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Grid */}
            <h3 className="text-2xl font-bold text-center mb-8">Why List on CigarMap?</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Increase Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Get discovered by cigar enthusiasts searching for lounges in your area
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Build Trust</h4>
                  <p className="text-sm text-muted-foreground">
                    Get verified and show potential customers your lounge is legitimate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Stand Out</h4>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to featured placement and premium tools to grow your business
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Comparison */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Listing */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-1">Free Listing</h4>
                  <p className="text-3xl font-bold text-primary mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      Business name & address listed
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
                      Appear in city search results
                    </li>
                  </ul>
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
                  <p className="text-3xl font-bold text-primary mb-4">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <ul className="space-y-3">
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
                      Priority in search results
                    </li>
                  </ul>
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
        </div>
      </section>
    </Layout>
  );
}
