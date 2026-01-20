'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Lounge, City } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Store,
  Search,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Shield,
  ExternalLink,
} from 'lucide-react';

const LOUNGE_TYPES = ['Lounge', 'Bar', 'Retail', 'Private Club'] as const;
const AMENITIES = ['BYOB', 'Full Bar', 'Outdoor Patio', 'Live Music', 'TVs'] as const;

type LoungeWithCity = Lounge & { cities: { name: string } | null };

type LoungeFormData = {
  name: string;
  city_id: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  lounge_type: string;
  amenities: string[];
  is_featured: boolean;
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
};

const initialFormData: LoungeFormData = {
  name: '',
  city_id: '',
  address: '',
  phone: '',
  website: '',
  description: '',
  lounge_type: 'Lounge',
  amenities: [],
  is_featured: false,
  is_verified: false,
  status: 'pending',
};

export default function LoungesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingLounge, setEditingLounge] = useState<LoungeWithCity | null>(null);
  const [deletingLounge, setDeletingLounge] = useState<LoungeWithCity | null>(null);
  const [formData, setFormData] = useState<LoungeFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch lounges with city data
  const { data: lounges, isLoading } = useQuery({
    queryKey: ['admin-lounges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lounges')
        .select('*, cities(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LoungeWithCity[];
    },
  });

  // Fetch cities for dropdown
  const { data: cities } = useQuery({
    queryKey: ['admin-cities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Pick<City, 'id' | 'name'>[];
    },
  });

  // Create lounge mutation
  const createMutation = useMutation({
    mutationFn: async (data: LoungeFormData) => {
      const { error } = await supabase.from('lounges').insert([{
        ...data,
        lounge_type: data.lounge_type as Lounge['lounge_type'],
        status: data.status as Lounge['status'],
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lounges'] });
      toast.success('Lounge created successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update lounge mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LoungeFormData> }) => {
      const { error } = await supabase.from('lounges').update({
        ...data,
        lounge_type: data.lounge_type as Lounge['lounge_type'],
        status: data.status as Lounge['status'],
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lounges'] });
      toast.success('Lounge updated successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete lounge mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lounges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lounges'] });
      toast.success('Lounge deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingLounge(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Quick status update
  const handleStatusChange = (lounge: LoungeWithCity, newStatus: 'approved' | 'rejected') => {
    updateMutation.mutate({ id: lounge.id, data: { status: newStatus } });
  };

  const handleOpenCreate = () => {
    setEditingLounge(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (lounge: LoungeWithCity) => {
    setEditingLounge(lounge);
    setFormData({
      name: lounge.name,
      city_id: lounge.city_id || '',
      address: lounge.address || '',
      phone: lounge.phone || '',
      website: lounge.website || '',
      description: lounge.description || '',
      lounge_type: lounge.lounge_type || 'Lounge',
      amenities: lounge.amenities || [],
      is_featured: lounge.is_featured,
      is_verified: lounge.is_verified,
      status: lounge.status,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLounge(null);
    setFormData(initialFormData);
  };

  const handleOpenDelete = (lounge: LoungeWithCity) => {
    setDeletingLounge(lounge);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLounge) {
      updateMutation.mutate({ id: editingLounge.id, data: formData });
    } else {
      createMutation.mutate(formData);
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

  const filteredLounges = lounges?.filter((lounge) => {
    const matchesSearch =
      lounge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lounge.cities?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lounge.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lounge.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
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
            Pending
          </Badge>
        );
    }
  };

  const pendingCount = lounges?.filter((l) => l.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Lounges</h1>
          <p className="text-muted-foreground">
            Manage cigar lounges and review submissions
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount} pending
              </Badge>
            )}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Lounge
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lounges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLounges && filteredLounges.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lounge</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Badges</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLounges.map((lounge) => (
                    <TableRow key={lounge.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {lounge.images?.[0] ? (
                            <img
                              src={lounge.images[0]}
                              alt={lounge.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-stone-100 flex items-center justify-center">
                              <Store className="h-5 w-5 text-stone-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{lounge.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {lounge.address}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lounge.cities?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lounge.lounge_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(lounge.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {lounge.is_featured && (
                            <Badge className="bg-amber-100 text-amber-700" title="Featured">
                              <Star className="h-3 w-3" />
                            </Badge>
                          )}
                          {lounge.is_verified && (
                            <Badge className="bg-blue-100 text-blue-700" title="Verified">
                              <Shield className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(lounge)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {lounge.website && (
                              <DropdownMenuItem asChild>
                                <a href={lounge.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Visit Website
                                </a>
                              </DropdownMenuItem>
                            )}
                            {lounge.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(lounge, 'approved')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(lounge, 'rejected')}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(lounge)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-4 text-lg font-medium">No lounges found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try different filters'
                  : 'Get started by adding your first lounge'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLounge ? 'Edit Lounge' : 'Add Lounge'}</DialogTitle>
            <DialogDescription>
              {editingLounge ? 'Update lounge details' : 'Add a new lounge to the directory'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Lounge Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., The Cigar Vault"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_id">City *</Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the lounge, atmosphere, offerings..."
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as LoungeFormData['status'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between flex-1 p-3 border rounded-lg">
                  <Label htmlFor="is_featured" className="cursor-pointer">Featured Lounge</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between flex-1 p-3 border rounded-lg">
                  <Label htmlFor="is_verified" className="cursor-pointer">Verified</Label>
                  <Switch
                    id="is_verified"
                    checked={formData.is_verified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_verified: checked })
                    }
                  />
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingLounge
                  ? 'Update Lounge'
                  : 'Create Lounge'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lounge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingLounge?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletingLounge && deleteMutation.mutate(deletingLounge.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
