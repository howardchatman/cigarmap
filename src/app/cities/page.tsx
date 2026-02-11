'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { CityCard } from '@/components/CityCard';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UPCOMING_CITIES = [
  { name: 'Houston', state: 'TX', image: 'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=400&h=300&auto=format&fit=crop' },
  { name: 'Dallas', state: 'TX', image: 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=400&h=300&auto=format&fit=crop' },
  { name: 'Austin', state: 'TX', image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=400&h=300&auto=format&fit=crop' },
  { name: 'San Antonio', state: 'TX', image: 'https://images.unsplash.com/photo-1588580261449-5cd5e1a3920e?w=400&h=300&auto=format&fit=crop' },
  { name: 'Miami', state: 'FL', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=400&h=300&auto=format&fit=crop' },
  { name: 'Tampa', state: 'FL', image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=400&h=300&auto=format&fit=crop' },
  { name: 'Atlanta', state: 'GA', image: 'https://images.unsplash.com/photo-1575917649908-c3b32e3fc064?w=400&h=300&auto=format&fit=crop' },
  { name: 'Nashville', state: 'TN', image: 'https://images.unsplash.com/photo-1545419913-775e4b8e2930?w=400&h=300&auto=format&fit=crop' },
  { name: 'Charlotte', state: 'NC', image: 'https://images.unsplash.com/photo-1577084381938-22d40eed0e2b?w=400&h=300&auto=format&fit=crop' },
  { name: 'Las Vegas', state: 'NV', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&auto=format&fit=crop' },
  { name: 'New York', state: 'NY', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&auto=format&fit=crop' },
  { name: 'Chicago', state: 'IL', image: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=400&h=300&auto=format&fit=crop' },
  { name: 'Los Angeles', state: 'CA', image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400&h=300&auto=format&fit=crop' },
  { name: 'Phoenix', state: 'AZ', image: 'https://images.unsplash.com/photo-1558645836-e44122a743ee?w=400&h=300&auto=format&fit=crop' },
  { name: 'Denver', state: 'CO', image: 'https://images.unsplash.com/photo-1619856699906-09e1f4ef34b9?w=400&h=300&auto=format&fit=crop' },
  { name: 'New Orleans', state: 'LA', image: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=400&h=300&auto=format&fit=crop' },
  { name: 'Detroit', state: 'MI', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=300&auto=format&fit=crop' },
  { name: 'Philadelphia', state: 'PA', image: 'https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=400&h=300&auto=format&fit=crop' },
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
                className="group bg-white rounded-lg border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="relative h-24 overflow-hidden">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-3 text-center">
                  <p className="font-semibold text-foreground text-sm">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.state}</p>
                </div>
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
