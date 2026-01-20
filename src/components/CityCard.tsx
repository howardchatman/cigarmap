import Link from 'next/link'
import { City } from '@/types';
import { getLoungeCountByCity } from '@/data/mockData';
import { MapPin } from 'lucide-react';

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const loungeCount = getLoungeCountByCity(city.id);

  return (
    <Link 
      href={`/cities/${city.slug}`}
      className="group relative overflow-hidden rounded-lg aspect-[4/3] block"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${city.heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="text-2xl font-bold text-cream mb-2 group-hover:text-primary transition-colors">
          {city.name}
        </h3>
        <div className="flex items-center gap-2 text-cream/80">
          <MapPin className="h-4 w-4" />
          <span>{loungeCount} {loungeCount === 1 ? 'Lounge' : 'Lounges'}</span>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-lg transition-colors" />
    </Link>
  );
}