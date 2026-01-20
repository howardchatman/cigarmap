import { City, Lounge } from '@/types';

export const cities: City[] = [
  {
    id: 'houston',
    name: 'Houston',
    slug: 'houston',
    description: 'Houston boasts a thriving cigar culture with upscale lounges scattered across Montrose, the Heights, and Galleria. From intimate private clubs to lively cigar bars, the Space City offers something for every aficionado.',
    heroImage: 'https://images.unsplash.com/photo-1548519853-e3c95328b7a5?w=800&auto=format&fit=crop',
    isFeatured: true,
  },
  {
    id: 'dallas',
    name: 'Dallas',
    slug: 'dallas',
    description: 'Dallas delivers a refined cigar scene with luxurious lounges in Uptown, Highland Park, and Deep Ellum. The Big D combines Southern hospitality with world-class cigar experiences.',
    heroImage: 'https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800&auto=format&fit=crop',
    isFeatured: true,
  },
  {
    id: 'fort-worth',
    name: 'Fort Worth',
    slug: 'fort-worth',
    description: 'Fort Worth brings cowboy culture to the cigar world with Western-themed lounges and classic establishments. The city\'s Stockyards district is home to some of Texas\'s most unique cigar experiences.',
    heroImage: 'https://images.unsplash.com/photo-1531218150460-475c7827c715?w=800&auto=format&fit=crop',
    isFeatured: true,
  },
  {
    id: 'chicago',
    name: 'Chicago',
    slug: 'chicago',
    description: 'Chicago\'s cigar scene reflects its big-city sophistication. From speakeasy-style lounges in River North to cozy neighborhood spots, the Windy City offers diverse options for cigar enthusiasts.',
    heroImage: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&auto=format&fit=crop',
    isFeatured: true,
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    slug: 'los-angeles',
    description: 'Los Angeles combines Hollywood glamour with laid-back cigar culture. Find celebrity hotspots in Beverly Hills, beachside lounges in Santa Monica, and hidden gems throughout the city.',
    heroImage: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&auto=format&fit=crop',
    isFeatured: true,
  },
  {
    id: 'tampa',
    name: 'Tampa',
    slug: 'tampa',
    description: 'Tampa is the historic heart of American cigar making. Ybor City\'s legendary cigar heritage lives on in authentic factories, classic lounges, and a vibrant cigar community.',
    heroImage: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&auto=format&fit=crop',
    isFeatured: true,
  },
];

export const lounges: Lounge[] = [
  // Houston Lounges
  {
    id: 'houston-1',
    name: 'The Velvet Smoke',
    cityId: 'houston',
    address: '2401 Main Street, Houston, TX 77002',
    phone: '(713) 555-0101',
    website: 'https://velvetsmoke.example.com',
    description: 'An upscale cigar lounge in the heart of Midtown Houston. The Velvet Smoke offers a curated selection of premium cigars, craft cocktails, and a sophisticated atmosphere perfect for business meetings or relaxed evenings.',
    loungeType: 'Lounge',
    amenities: ['Full Bar', 'Outdoor Patio', 'TVs'],
    images: [
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
  {
    id: 'houston-2',
    name: 'Bayou Cigar Club',
    cityId: 'houston',
    address: '5678 Westheimer Road, Houston, TX 77057',
    phone: '(713) 555-0102',
    website: 'https://bayoucigar.example.com',
    description: 'A members-only private club offering exclusive access to rare cigars, private lockers, and networking events. The perfect retreat for serious aficionados.',
    loungeType: 'Private Club',
    amenities: ['Full Bar', 'Live Music'],
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
    ],
    isFeatured: false,
    isClaimed: true,
  },
  {
    id: 'houston-3',
    name: 'Heights Tobacco Co.',
    cityId: 'houston',
    address: '1234 Yale Street, Houston, TX 77008',
    phone: '(713) 555-0103',
    website: 'https://heightstobacco.example.com',
    description: 'A neighborhood favorite in the Heights offering quality cigars, friendly service, and a relaxed atmosphere. BYOB welcome.',
    loungeType: 'Retail',
    amenities: ['BYOB', 'Outdoor Patio'],
    images: [
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop',
    ],
    isFeatured: false,
    isClaimed: false,
  },

  // Dallas Lounges
  {
    id: 'dallas-1',
    name: 'Uptown Smoke House',
    cityId: 'dallas',
    address: '3300 McKinney Avenue, Dallas, TX 75204',
    phone: '(214) 555-0201',
    website: 'https://uptownsmoke.example.com',
    description: 'Dallas\'s premier cigar destination in the heart of Uptown. Features a walk-in humidor, craft cocktails, and live jazz on weekends.',
    loungeType: 'Bar',
    amenities: ['Full Bar', 'Live Music', 'Outdoor Patio'],
    images: [
      'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
  {
    id: 'dallas-2',
    name: 'Highland Cigar Lounge',
    cityId: 'dallas',
    address: '4500 Preston Road, Dallas, TX 75205',
    phone: '(214) 555-0202',
    website: 'https://highlandcigar.example.com',
    description: 'An elegant lounge in Highland Park catering to discerning clientele. Known for exceptional service and rare cigar selections.',
    loungeType: 'Lounge',
    amenities: ['Full Bar', 'TVs'],
    images: [
      'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: false,
  },

  // Fort Worth Lounges
  {
    id: 'fort-worth-1',
    name: 'Stockyard Cigars',
    cityId: 'fort-worth',
    address: '140 E Exchange Ave, Fort Worth, TX 76164',
    phone: '(817) 555-0301',
    website: 'https://stockyardcigars.example.com',
    description: 'Experience Western heritage meets cigar culture in the historic Stockyards. Authentic atmosphere with quality cigars and Texas hospitality.',
    loungeType: 'Lounge',
    amenities: ['BYOB', 'Outdoor Patio', 'Live Music'],
    images: [
      'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
  {
    id: 'fort-worth-2',
    name: 'Sundance Square Smoke',
    cityId: 'fort-worth',
    address: '420 Main Street, Fort Worth, TX 76102',
    phone: '(817) 555-0302',
    website: 'https://sundancesmoke.example.com',
    description: 'A modern lounge in downtown Fort Worth\'s entertainment district. Perfect for pre-dinner cigars or late-night relaxation.',
    loungeType: 'Bar',
    amenities: ['Full Bar', 'TVs'],
    images: [
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&auto=format&fit=crop',
    ],
    isFeatured: false,
    isClaimed: false,
  },

  // Chicago Lounges
  {
    id: 'chicago-1',
    name: 'River North Cigar Club',
    cityId: 'chicago',
    address: '456 N Clark Street, Chicago, IL 60654',
    phone: '(312) 555-0401',
    website: 'https://rivernorthcigar.example.com',
    description: 'A speakeasy-inspired lounge in River North with prohibition-era charm. Features craft cocktails, premium cigars, and weekend jazz.',
    loungeType: 'Lounge',
    amenities: ['Full Bar', 'Live Music'],
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
  {
    id: 'chicago-2',
    name: 'Wicker Park Tobacco',
    cityId: 'chicago',
    address: '1650 N Milwaukee Ave, Chicago, IL 60647',
    phone: '(312) 555-0402',
    website: 'https://wickerparktobacco.example.com',
    description: 'A laid-back neighborhood spot in trendy Wicker Park. Known for knowledgeable staff and excellent cigar recommendations.',
    loungeType: 'Retail',
    amenities: ['BYOB', 'Outdoor Patio'],
    images: [
      'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&auto=format&fit=crop',
    ],
    isFeatured: false,
    isClaimed: false,
  },

  // Los Angeles Lounges
  {
    id: 'los-angeles-1',
    name: 'Beverly Hills Cigar Club',
    cityId: 'los-angeles',
    address: '9876 Wilshire Blvd, Beverly Hills, CA 90210',
    phone: '(310) 555-0501',
    website: 'https://beverlyhillscigar.example.com',
    description: 'The ultimate Hollywood cigar experience. A-list clientele, rare Cuban selections, and impeccable service in an exclusive setting.',
    loungeType: 'Private Club',
    amenities: ['Full Bar', 'Outdoor Patio'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
  {
    id: 'los-angeles-2',
    name: 'Santa Monica Smoke',
    cityId: 'los-angeles',
    address: '1234 Ocean Avenue, Santa Monica, CA 90401',
    phone: '(310) 555-0502',
    website: 'https://santamonikasmoke.example.com',
    description: 'Beachside cigar lounge with ocean views. Enjoy premium cigars with craft cocktails as the sun sets over the Pacific.',
    loungeType: 'Bar',
    amenities: ['Full Bar', 'Outdoor Patio', 'TVs'],
    images: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop',
    ],
    isFeatured: false,
    isClaimed: true,
  },

  // Tampa Lounges
  {
    id: 'tampa-1',
    name: 'Ybor City Cigar Factory',
    cityId: 'tampa',
    address: '1523 E 7th Avenue, Tampa, FL 33605',
    phone: '(813) 555-0601',
    website: 'https://yborcigars.example.com',
    description: 'Historic cigar factory in the heart of Ybor City. Watch cigars being hand-rolled while enjoying the authentic Tampa cigar experience.',
    loungeType: 'Retail',
    amenities: ['BYOB', 'Outdoor Patio'],
    images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
  {
    id: 'tampa-2',
    name: 'King Corona Cigars',
    cityId: 'tampa',
    address: '1600 E 8th Avenue, Tampa, FL 33605',
    phone: '(813) 555-0602',
    website: 'https://kingcorona.example.com',
    description: 'A Tampa institution since the 1900s. Family-owned and operated with deep roots in the city\'s cigar heritage.',
    loungeType: 'Lounge',
    amenities: ['Full Bar', 'Live Music', 'TVs'],
    images: [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop',
    ],
    isFeatured: true,
    isClaimed: true,
  },
];

export const getCityBySlug = (slug: string): City | undefined => {
  return cities.find(city => city.slug === slug);
};

export const getLoungeById = (id: string): Lounge | undefined => {
  return lounges.find(lounge => lounge.id === id);
};

export const getLoungesByCity = (cityId: string): Lounge[] => {
  return lounges.filter(lounge => lounge.cityId === cityId);
};

export const getFeaturedCities = (): City[] => {
  return cities.filter(city => city.isFeatured);
};

export const getFeaturedLounges = (): Lounge[] => {
  return lounges.filter(lounge => lounge.isFeatured);
};

export const getLoungeCountByCity = (cityId: string): number => {
  return lounges.filter(lounge => lounge.cityId === cityId).length;
};