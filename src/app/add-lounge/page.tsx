'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { LoungeType, Amenity } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Star, Upload, Globe, Loader2 } from 'lucide-react';
import { firecrawlApi } from '@/lib/api/firecrawl';

const loungeTypes: LoungeType[] = ['Lounge', 'Bar', 'Retail', 'Private Club'];
const amenitiesList: Amenity[] = ['BYOB', 'Full Bar', 'Outdoor Patio', 'Live Music', 'TVs'];

export default function AddLounge() {
  const { toast } = useToast();
  const supabase = createClient();
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Fetch cities from Supabase
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-for-add'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    cityId: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    loungeType: '' as LoungeType | '',
    amenities: [] as Amenity[],
  });

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to import from.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await firecrawlApi.scrape(importUrl, {
        formats: ['markdown', { type: 'json', prompt: 'Extract business information: name, address, phone number, website URL, description, and any amenities mentioned (like BYOB, Full Bar, Outdoor Patio, Live Music, TVs)' }],
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to scrape URL');
      }

      const responseData = response.data || response;
      const scrapedData = responseData?.json;
      const metadata = responseData?.metadata;

      // Auto-fill form with scraped data
      setFormData(prev => ({
        ...prev,
        name: scrapedData?.name || metadata?.title || prev.name,
        address: scrapedData?.address || prev.address,
        phone: scrapedData?.phone || scrapedData?.phone_number || prev.phone,
        website: importUrl,
        description: scrapedData?.description || response.data?.markdown?.slice(0, 500) || prev.description,
      }));

      // Try to match amenities from scraped data
      if (scrapedData?.amenities) {
        const matchedAmenities: Amenity[] = [];
        const scrapedAmenities = Array.isArray(scrapedData.amenities)
          ? scrapedData.amenities.join(' ').toLowerCase()
          : String(scrapedData.amenities).toLowerCase();

        amenitiesList.forEach(amenity => {
          if (scrapedAmenities.includes(amenity.toLowerCase())) {
            matchedAmenities.push(amenity);
          }
        });

        if (matchedAmenities.length > 0) {
          setFormData(prev => ({ ...prev, amenities: matchedAmenities }));
        }
      }

      toast({
        title: "Import Successful",
        description: "Form has been pre-filled with scraped data. Please review and complete.",
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from URL",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.cityId || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
    toast({
      title: "Submission Received!",
      description: "We'll review your listing and get back to you soon.",
    });

    // Reset form
    setFormData({
      name: '',
      cityId: '',
      address: '',
      phone: '',
      website: '',
      description: '',
      loungeType: '',
      amenities: [],
    });
    setImportUrl('');
  };

  const toggleAmenity = (amenity: Amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            Add or Claim Your Lounge
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
            Get your cigar lounge listed on CigarMap and connect with enthusiasts in your area
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              {/* Import from URL Section */}
              <div className="mb-8 p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Quick Import from Website
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Have an existing website? Paste the URL and we'll auto-fill the form with your lounge details.
                </p>
                <div className="flex gap-3">
                  <Input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://yourlounge.com"
                    className="flex-1"
                    disabled={isImporting}
                  />
                  <Button
                    onClick={handleImportFromUrl}
                    disabled={isImporting}
                    variant="secondary"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import'
                    )}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Lounge Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Lounge Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., The Velvet Smoke"
                    required
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={formData.cityId}
                    onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., 2401 Main Street, Houston, TX 77002"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., (713) 555-0101"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="e.g., https://yourlounge.com"
                  />
                </div>

                {/* Lounge Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Lounge Type</Label>
                  <Select
                    value={formData.loungeType}
                    onValueChange={(value) => setFormData({ ...formData, loungeType: value as LoungeType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loungeTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenitiesList.map(amenity => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <Label htmlFor={amenity} className="font-normal cursor-pointer">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your lounge..."
                    rows={5}
                  />
                </div>

                {/* Image Upload Placeholder */}
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Image upload coming soon
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" size="lg" className="w-full md:w-auto">
                  Submit Listing
                </Button>
              </form>
            </div>

            {/* Sidebar - Benefits */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border sticky top-24">
                <h3 className="text-xl font-semibold text-card-foreground mb-6">
                  Listing Benefits
                </h3>

                {/* Free Listing */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h4 className="font-semibold text-card-foreground mb-3">Free Listing</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Basic information (name, address, contact)
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Appear in city listings
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Discoverable by cigar enthusiasts
                    </li>
                  </ul>
                </div>

                {/* Claimed Listing */}
                <div>
                  <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    Claimed Listing
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      Full profile with photos and description
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      Verified badge for trust
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      Featured placement opportunities
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      Promotional features and highlights
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
