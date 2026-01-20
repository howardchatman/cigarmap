'use client';

import { Layout } from '@/components/Layout';
import { MapPin, Users, Heart } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            About CigarMap
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
            Connecting cigar enthusiasts with the best lounges across the country
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg">
              <p className="text-lg text-muted-foreground mb-8">
                CigarMap was born from a simple frustration: finding quality cigar lounges while traveling
                shouldn't be so hard. Whether you're a seasoned aficionado or just exploring the world of
                premium cigars, you deserve a reliable guide to the best spots in every city.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                <div className="text-center p-6 bg-card rounded-lg border border-border">
                  <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Discover</h3>
                  <p className="text-muted-foreground text-sm">
                    Find hidden gems and popular spots in any city
                  </p>
                </div>

                <div className="text-center p-6 bg-card rounded-lg border border-border">
                  <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Connect</h3>
                  <p className="text-muted-foreground text-sm">
                    Join a community of cigar enthusiasts
                  </p>
                </div>

                <div className="text-center p-6 bg-card rounded-lg border border-border">
                  <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Support</h3>
                  <p className="text-muted-foreground text-sm">
                    Help local lounges thrive and grow
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-8">
                We're building the most comprehensive and reliable directory of cigar lounges in America.
                Our goal is simple: make it easy to find, explore, and support great cigar establishments
                wherever you are.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">For Lounge Owners</h2>
              <p className="text-muted-foreground">
                CigarMap helps you connect with customers who are actively looking for cigar experiences.
                Claim your listing to unlock full profiles, featured placement, and promotional opportunities.
                Together, we're building a stronger cigar community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
