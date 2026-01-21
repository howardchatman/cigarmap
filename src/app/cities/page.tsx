'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { CityCard } from '@/components/CityCard';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

      {/* Cities Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cities available yet. Check back soon!</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Don't See Your City?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Help us expand our directory by adding lounges in your area.
          </p>
          <Button asChild>
            <Link href="/add-lounge">
              Add a Lounge
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
