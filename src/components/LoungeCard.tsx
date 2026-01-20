import Link from 'next/link'
import Image from 'next/image'
import { Lounge } from '@/types'
import { cities } from '@/data/mockData'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LoungeCardProps {
  lounge: Lounge
}

export function LoungeCard({ lounge }: LoungeCardProps) {
  const city = cities.find(c => c.id === lounge.cityId)

  return (
    <Link
      href={`/lounge/${lounge.id}`}
      className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={lounge.images[0]} 
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
        
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{city?.name}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {lounge.loungeType}
          </Badge>
        </div>

        {/* Amenities */}
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
      </div>
    </Link>
  );
}