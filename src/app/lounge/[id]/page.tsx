'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Globe,
  Star,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';

export default function LoungeDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const supabase = createClient();

  const { data: lounge, isLoading, error } = useQuery({
    queryKey: ['lounge', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lounges')
        .select('*, cities(name, slug)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        cityId: data.city_id,
        cityName: data.cities?.name,
        citySlug: data.cities?.slug,
        address: data.address,
        phone: data.phone,
        website: data.website,
        description: data.description,
        loungeType: data.lounge_type,
        amenities: data.amenities || [],
        images: data.images || [],
        isFeatured: data.is_featured,
        isClaimed: data.is_claimed,
        isVerified: data.is_verified,
        instagram: data.instagram,
        facebook: data.facebook,
        twitter: data.twitter,
        tiktok: data.tiktok,
        coverImage: data.cover_image,
      };
    },
    enabled: !!id,
  });

  const defaultImage = 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop';

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

  // Not found
  if (error || !lounge) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lounge Not Found</h1>
          <Button asChild>
            <Link href="/cities">Browse Cities</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Back Navigation */}
      <div className="bg-muted py-4">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild>
            <Link href={lounge.citySlug ? `/cities/${lounge.citySlug}` : '/cities'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {lounge.cityName || 'Cities'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <section className="relative h-[40vh] md:h-[50vh]">
        <img
          src={lounge.coverImage || lounge.images?.[0] || defaultImage}
          alt={lounge.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </section>

      {/* Content */}
      <section className="py-12 bg-background -mt-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {lounge.isFeatured && (
                  <Badge className="bg-accent text-accent-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {(lounge.isClaimed || lounge.isVerified) && (
                  <Badge className="bg-primary text-primary-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {lounge.loungeType && (
                  <Badge variant="outline">{lounge.loungeType}</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {lounge.name}
              </h1>

              {/* Location */}
              {lounge.cityName && (
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <MapPin className="h-5 w-5" />
                  <span>{lounge.cityName}</span>
                </div>
              )}

              {/* Amenities */}
              {lounge.amenities && lounge.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {lounge.amenities.map((amenity: string) => (
                      <Badge key={amenity} variant="secondary" className="text-sm">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {lounge.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {lounge.description}
                  </p>
                </div>
              )}

              {/* Image Gallery */}
              {lounge.images && lounge.images.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {lounge.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${lounge.name} - Image ${index + 1}`}
                        className="rounded-lg object-cover aspect-video w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border sticky top-24">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Contact</h3>

                <div className="space-y-4">
                  {/* Address */}
                  {lounge.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-card-foreground">{lounge.address}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {lounge.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <a
                        href={`tel:${lounge.phone}`}
                        className="text-card-foreground hover:text-primary transition-colors"
                      >
                        {lounge.phone}
                      </a>
                    </div>
                  )}

                  {/* Website */}
                  {lounge.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary shrink-0" />
                      <a
                        href={lounge.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-card-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {(lounge.instagram || lounge.facebook || lounge.twitter) && (
                  <>
                    <hr className="my-6 border-border" />
                    <h4 className="text-sm font-semibold text-card-foreground mb-3">Follow Us</h4>
                    <div className="flex gap-3">
                      {lounge.instagram && (
                        <a
                          href={lounge.instagram.startsWith('http') ? lounge.instagram : `https://instagram.com/${lounge.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <Instagram className="h-5 w-5 text-muted-foreground" />
                        </a>
                      )}
                      {lounge.facebook && (
                        <a
                          href={lounge.facebook.startsWith('http') ? lounge.facebook : `https://facebook.com/${lounge.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <Facebook className="h-5 w-5 text-muted-foreground" />
                        </a>
                      )}
                      {lounge.twitter && (
                        <a
                          href={lounge.twitter.startsWith('http') ? lounge.twitter : `https://twitter.com/${lounge.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <Twitter className="h-5 w-5 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </>
                )}

                <hr className="my-6 border-border" />

                {/* Claim CTA */}
                {!lounge.isClaimed && !lounge.isVerified && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Is this your lounge?
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/add-lounge">
                        Claim this Listing
                      </Link>
                    </Button>
                  </div>
                )}

                {(lounge.isClaimed || lounge.isVerified) && (
                  <div className="text-center">
                    <Badge className="bg-primary/10 text-primary">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified Business
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
