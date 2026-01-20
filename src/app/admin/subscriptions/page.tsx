'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionPlan } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CreditCard, Check, DollarSign } from 'lucide-react';

type PlanFormData = {
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features: string;
  is_active: boolean;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
};

const initialFormData: PlanFormData = {
  name: '',
  slug: '',
  price_monthly: 0,
  price_yearly: 0,
  features: '',
  is_active: true,
  stripe_price_id_monthly: '',
  stripe_price_id_yearly: '',
};

export default function SubscriptionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);

  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Fetch subscription stats
  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const { data: lounges } = await supabase
        .from('lounges')
        .select('subscription_plan_id, subscription_status');

      const activeCount = lounges?.filter((l) => l.subscription_status === 'active').length || 0;
      const planCounts: Record<string, number> = {};
      lounges?.forEach((l) => {
        if (l.subscription_plan_id && l.subscription_status === 'active') {
          planCounts[l.subscription_plan_id] = (planCounts[l.subscription_plan_id] || 0) + 1;
        }
      });

      return { activeCount, planCounts };
    },
  });

  // Create plan mutation
  const createMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const { error } = await supabase.from('subscription_plans').insert([{
        ...data,
        features: data.features.split('\n').filter(Boolean),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan created successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PlanFormData }) => {
      const { error } = await supabase.from('subscription_plans').update({
        ...data,
        features: data.features.split('\n').filter(Boolean),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan updated successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingPlan(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    const features = Array.isArray(plan.features) ? plan.features.join('\n') : '';
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price_monthly: plan.price_monthly / 100, // Convert cents to dollars for display
      price_yearly: plan.price_yearly / 100,
      features,
      is_active: plan.is_active,
      stripe_price_id_monthly: plan.stripe_price_id_monthly || '',
      stripe_price_id_yearly: plan.stripe_price_id_yearly || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
    setFormData(initialFormData);
  };

  const handleOpenDelete = (plan: SubscriptionPlan) => {
    setDeletingPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    const data = {
      ...formData,
      slug,
      price_monthly: Math.round(formData.price_monthly * 100), // Convert dollars to cents
      price_yearly: Math.round(formData.price_yearly * 100),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage pricing tiers for lounge owners</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans?.filter((p) => p.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : plans && plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {!plan.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <span className="text-2xl font-bold text-stone-900">
                        {formatPrice(plan.price_monthly)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      or {formatPrice(plan.price_yearly)}/year
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleOpenDelete(plan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature as string}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {stats?.planCounts?.[plan.id] || 0} active subscribers
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-4 text-lg font-medium">No plans created</h3>
              <p className="text-muted-foreground">
                Create your first subscription plan to start monetizing
              </p>
              <Button
                onClick={handleOpenCreate}
                className="mt-4 bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update subscription plan details' : 'Create a new subscription tier'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Pro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., pro (auto-generated if empty)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_monthly"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_monthly}
                      onChange={(e) =>
                        setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })
                      }
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_yearly"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_yearly}
                      onChange={(e) =>
                        setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })
                      }
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Claimed listing&#10;Basic profile&#10;Contact info display"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe_price_id_monthly">Stripe Monthly Price ID</Label>
                <Input
                  id="stripe_price_id_monthly"
                  value={formData.stripe_price_id_monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, stripe_price_id_monthly: e.target.value })
                  }
                  placeholder="price_xxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe_price_id_yearly">Stripe Yearly Price ID</Label>
                <Input
                  id="stripe_price_id_yearly"
                  value={formData.stripe_price_id_yearly}
                  onChange={(e) =>
                    setFormData({ ...formData, stripe_price_id_yearly: e.target.value })
                  }
                  placeholder="price_xxx"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
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
                  : editingPlan
                  ? 'Update Plan'
                  : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{deletingPlan?.name}" plan? This action cannot
              be undone. Existing subscriptions will remain but new subscriptions won't be possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletingPlan && deleteMutation.mutate(deletingPlan.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
