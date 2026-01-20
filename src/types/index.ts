export type LoungeType = 'Lounge' | 'Bar' | 'Retail' | 'Private Club';

export type Amenity = 'BYOB' | 'Full Bar' | 'Outdoor Patio' | 'Live Music' | 'TVs';

export interface City {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  isFeatured: boolean;
}

export interface Lounge {
  id: string;
  name: string;
  cityId: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  loungeType: LoungeType;
  amenities: Amenity[];
  images: string[];
  isFeatured: boolean;
  isClaimed: boolean;
}