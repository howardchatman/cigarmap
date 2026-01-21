'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CityCard } from '@/components/CityCard';
import { Layout } from '@/components/Layout';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Plus, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const supabase = createClient();

  const { data: featuredCities = [], isLoading } = useQuery({
    queryKey: ['featured-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*, lounges:lounges(count)')
        .eq('is_featured', true)
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
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/70 to-background" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <MapPin className="h-10 w-10 text-primary" />
              <span className="text-2xl text-cream font-bold">CigarMap</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Discover Cigar Lounges,{' '}
              <span className="text-primary">City by City</span>
            </h1>

            <p className="text-lg md:text-xl text-cream/80 mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              CigarMap is your global directory for cigar lounges, cigar bars, and cigar culture.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/cities">
                  Explore Cities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent border-cream/30 text-cream hover:bg-cream/10 hover:text-cream">
                <Link href="/add-lounge">
                  <Plus className="mr-2 h-5 w-5" />
                  Add a Lounge
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-cream/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Cities
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore cigar culture in these popular destinations
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredCities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured cities yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCities.map((city, index) => (
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

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/cities">
                View All Cities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Own a Cigar Lounge?
          </h2>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto mb-8">
            Get your lounge listed on CigarMap and connect with cigar enthusiasts in your area.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/add-lounge">
              Claim Your Listing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
