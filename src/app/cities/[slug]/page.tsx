'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { LoungeCard } from '@/components/LoungeCard';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Filter, X, Loader2 } from 'lucide-react';
import { LoungeType, Amenity } from '@/types';

const loungeTypes: LoungeType[] = ['Lounge', 'Bar', 'Retail', 'Private Club'];
const amenitiesList: Amenity[] = ['BYOB', 'Full Bar', 'Outdoor Patio', 'Live Music', 'TVs'];

export default function CityDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const supabase = createClient();

  // Fetch city by slug
  const { data: city, isLoading: cityLoading, error: cityError } = useQuery({
    queryKey: ['city', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        heroImage: data.hero_image || 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop',
      };
    },
    enabled: !!slug,
  });

  // Fetch lounges for this city
  const { data: allLounges = [], isLoading: loungesLoading } = useQuery({
    queryKey: ['city-lounges', city?.id],
    queryFn: async () => {
      if (!city?.id) return [];
      const { data, error } = await supabase
        .from('lounges')
        .select('*, cities(name)')
        .eq('city_id', city.id)
        .eq('status', 'approved')
        .order('is_featured', { ascending: false });
      if (error) throw error;
      return data.map((lounge: any) => ({
        id: lounge.id,
        name: lounge.name,
        cityId: lounge.city_id,
        cityName: lounge.cities?.name,
        address: lounge.address,
        phone: lounge.phone,
        website: lounge.website,
        description: lounge.description,
        loungeType: lounge.lounge_type as LoungeType,
        amenities: lounge.amenities || [],
        images: lounge.images || [],
        isFeatured: lounge.is_featured,
        isClaimed: lounge.is_claimed,
      }));
    },
    enabled: !!city?.id,
  });

  const isLoading = cityLoading || loungesLoading;

  const [selectedTypes, setSelectedTypes] = useState<LoungeType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filteredLounges = useMemo(() => {
    return allLounges.filter(lounge => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(lounge.loungeType)) {
        return false;
      }
      if (selectedAmenities.length > 0 && !selectedAmenities.some(a => lounge.amenities.includes(a))) {
        return false;
      }
      if (featuredOnly && !lounge.isFeatured) {
        return false;
      }
      return true;
    });
  }, [allLounges, selectedTypes, selectedAmenities, featuredOnly]);

  const toggleType = (type: LoungeType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: Amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setFeaturedOnly(false);
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedAmenities.length > 0 || featuredOnly;

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // City not found
  if (cityError || !city) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">City Not Found</h1>
          <Button asChild>
            <Link href="/cities">Back to Cities</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${city.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-secondary/70 to-secondary/50" />

        <div className="relative container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-cream mb-4">
            {city.name}
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl">
            {city.description}
          </p>
        </div>
      </section>

      {/* Filters & Lounges */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="bg-card rounded-lg p-6 mb-8 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Lounge Type */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Lounge Type</p>
                <div className="flex flex-wrap gap-2">
                  {loungeTypes.map(type => (
                    <Badge
                      key={type}
                      variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Featured Only */}
              <div>
                <Badge
                  variant={featuredOnly ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                >
                  Featured Only
                </Badge>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredLounges.length} {filteredLounges.length === 1 ? 'lounge' : 'lounges'}
            </p>
          </div>

          {/* Lounges Grid */}
          {filteredLounges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLounges.map((lounge, index) => (
                <div
                  key={lounge.id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <LoungeCard lounge={lounge} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {allLounges.length === 0
                  ? 'No lounges have been added to this city yet.'
                  : 'No lounges match your filters.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">
            Own a cigar lounge in {city.name}?
          </h2>
          <p className="text-secondary-foreground/70 text-lg max-w-xl mx-auto mb-8">
            Claim your listing to unlock full profiles, featured placement, and promotions.
          </p>
          <Button asChild size="lg">
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
