'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { CityCard } from '@/components/CityCard';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UPCOMING_CITIES = [
  { name: 'Houston', state: 'TX' },
  { name: 'Dallas', state: 'TX' },
  { name: 'Austin', state: 'TX' },
  { name: 'San Antonio', state: 'TX' },
  { name: 'Miami', state: 'FL' },
  { name: 'Tampa', state: 'FL' },
  { name: 'Atlanta', state: 'GA' },
  { name: 'Nashville', state: 'TN' },
  { name: 'Charlotte', state: 'NC' },
  { name: 'Las Vegas', state: 'NV' },
  { name: 'New York', state: 'NY' },
  { name: 'Chicago', state: 'IL' },
  { name: 'Los Angeles', state: 'CA' },
  { name: 'Phoenix', state: 'AZ' },
  { name: 'Denver', state: 'CO' },
  { name: 'New Orleans', state: 'LA' },
  { name: 'Detroit', state: 'MI' },
  { name: 'Philadelphia', state: 'PA' },
];

export default function Cities() {
  const supabase = createClient();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*, lounges:lounges(count)')
        .order('name');
      if (error) throw error;
      return data.map((city: any) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        description: city.description,
        heroImage: city.hero_image || 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop',
        isFeatured: city.is_featured,
        loungeCount: city.lounges?.[0]?.count || 0,
      }));
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            Explore Cities
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
            Browse our growing directory of cigar-friendly cities across the country
          </p>
        </div>
      </section>

      {/* Active Cities Grid */}
      {isLoading ? (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </section>
      ) : cities.length > 0 ? (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">Active Cities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city, index) => (
                <div
                  key={city.id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <CityCard city={city} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Coming Soon Cities */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {cities.length > 0 ? 'Coming Soon' : 'Cities We\'re Launching In'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We're actively adding lounges in these cities. Own a lounge? Get listed first and stand out when we launch.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {UPCOMING_CITIES.map((city) => (
              <div
                key={`${city.name}-${city.state}`}
                className="bg-white rounded-lg border border-border p-4 text-center hover:border-primary/50 hover:shadow-md transition-all"
              >
                <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground text-sm">{city.name}</p>
                <p className="text-xs text-muted-foreground">{city.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">
            Own a Cigar Lounge?
          </h2>
          <p className="text-secondary-foreground/70 text-lg max-w-xl mx-auto mb-8">
            Get your lounge on CigarMap before your competitors. Be the first in your city.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/add-lounge">
                Add Your Lounge
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
