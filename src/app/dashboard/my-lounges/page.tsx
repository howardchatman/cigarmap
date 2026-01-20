'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TablesUpdate } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Store,
  Search,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Globe,
  CreditCard,
} from 'lucide-react';

const LOUNGE_TYPES = ['Lounge', 'Bar', 'Retail', 'Private Club'] as const;
const AMENITIES = ['BYOB', 'Full Bar', 'Outdoor Patio', 'Live Music', 'TVs'] as const;

type LoungeWithCity = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  lounge_type: string | null;
  amenities: string[] | null;
  images: string[] | null;
  is_featured: boolean;
  status: string;
  subscription_status: string | null;
  cities: { name: string } | null;
};

export default function MyLounges() {
  const { user } = useAuth();
  const supabase = createClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLounge, setEditingLounge] = useState<LoungeWithCity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    lounge_type: 'Lounge',
    amenities: [] as string[],
  });

  const queryClient = useQueryClient();

  // Fetch owner's lounges
  const { data: lounges, isLoading } = useQuery({
    queryKey: ['owner-lounges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('lounges')
        .select('*, cities(name)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LoungeWithCity[];
    },
    enabled: !!user?.id,
  });

  // Update lounge mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const updateData: TablesUpdate<'lounges'> = {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        website: data.website || null,
        description: data.description || null,
        lounge_type: data.lounge_type as 'Lounge' | 'Bar' | 'Retail' | 'Private Club',
        amenities: data.amenities,
      };
      const { error } = await supabase
        .from('lounges')
        .update(updateData)
        .eq('id', id)
        .eq('owner_id', user.id); // Security: ensure owner owns this lounge
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-lounges'] });
      toast.success('Lounge updated successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenEdit = (lounge: LoungeWithCity) => {
    setEditingLounge(lounge);
    setFormData({
      name: lounge.name,
      address: lounge.address || '',
      phone: lounge.phone || '',
      website: lounge.website || '',
      description: lounge.description || '',
      lounge_type: lounge.lounge_type || 'Lounge',
      amenities: lounge.amenities || [],
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLounge(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLounge) {
      updateMutation.mutate({ id: editingLounge.id, data: formData });
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const filteredLounges = lounges?.filter(
    (lounge) =>
      lounge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lounge.cities?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Live
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Under Review
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Lounges</h1>
          <p className="text-muted-foreground">Manage your cigar lounge listings</p>
        </div>
        <Button asChild className="bg-amber-600 hover:bg-amber-700">
          <Link href="/add-lounge">
            <Plus className="mr-2 h-4 w-4" />
            Add Lounge
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your lounges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredLounges && filteredLounges.length > 0 ? (
            <div className="space-y-4">
              {filteredLounges.map((lounge) => (
                <Card key={lounge.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-32 sm:h-auto bg-stone-100 flex-shrink-0">
                      {lounge.images?.[0] ? (
                        <img
                          src={lounge.images[0]}
                          alt={lounge.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-stone-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{lounge.name}</h3>
                            {lounge.is_featured && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                            {getStatusBadge(lounge.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lounge.cities?.name || 'No city'}
                            </span>
                            <Badge variant="outline">{lounge.lounge_type}</Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {lounge.subscription_status === 'active' ? (
                            <Badge className="bg-purple-100 text-purple-700">
                              <CreditCard className="mr-1 h-3 w-3" />
                              Subscribed
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/dashboard/billing">Upgrade</Link>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(lounge)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                        {lounge.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{lounge.address}</span>
                          </div>
                        )}
                        {lounge.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{lounge.phone}</span>
                          </div>
                        )}
                        {lounge.website && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <a
                              href={lounge.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-600 hover:underline truncate"
                            >
                              {lounge.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {lounge.amenities && lounge.amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {lounge.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-4 text-lg font-medium">No lounges found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : "You haven't added any lounges yet"}
              </p>
              {!searchQuery && (
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/add-lounge">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Lounge
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lounge</DialogTitle>
            <DialogDescription>Update your lounge information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Lounge Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Lounge Type</Label>
                <Select
                  value={formData.lounge_type}
                  onValueChange={(value) => setFormData({ ...formData, lounge_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOUNGE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant={formData.amenities.includes(amenity) ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        formData.amenities.includes(amenity)
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'hover:bg-stone-100'
                      }`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
