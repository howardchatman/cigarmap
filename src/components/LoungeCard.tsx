import Link from 'next/link'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LoungeCardProps {
  lounge: {
    id: string;
    name: string;
    cityId?: string;
    cityName?: string;
    address?: string;
    phone?: string;
    website?: string;
    description?: string;
    loungeType?: string;
    amenities?: string[];
    images?: string[];
    isFeatured?: boolean;
    isClaimed?: boolean;
  };
}

export function LoungeCard({ lounge }: LoungeCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop';

  return (
    <Link
      href={`/lounge/${lounge.id}`}
      className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={lounge.images?.[0] || defaultImage}
          alt={lounge.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {lounge.isFeatured && (
            <Badge className="bg-accent text-accent-foreground">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {lounge.isClaimed && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              <CheckCircle className="h-3 w-3 mr-1" />
              Claimed
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors mb-2">
          {lounge.name}
        </h3>
        
        {lounge.cityName && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{lounge.cityName}</span>
          </div>
        )}

        {lounge.loungeType && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {lounge.loungeType}
            </Badge>
          </div>
        )}

        {/* Amenities */}
        {lounge.amenities && lounge.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lounge.amenities.slice(0, 3).map(amenity => (
              <Badge key={amenity} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                {amenity}
              </Badge>
            ))}
            {lounge.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                +{lounge.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}