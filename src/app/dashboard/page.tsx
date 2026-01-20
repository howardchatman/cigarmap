'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Store,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user, profile } = useAuth();
  const supabase = createClient();

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
      return data;
    },
    enabled: !!user?.id,
  });

  const stats = lounges?.reduce(
    (acc, lounge) => {
      acc.total += 1;
      if (lounge.status === 'approved') acc.approved += 1;
      if (lounge.status === 'pending') acc.pending += 1;
      if (lounge.subscription_status === 'active') acc.activeSubscriptions += 1;
      return acc;
    },
    { total: 0, approved: 0, pending: 0, activeSubscriptions: 0 }
  ) || { total: 0, approved: 0, pending: 0, activeSubscriptions: 0 };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Owner'}
          </h1>
          <p className="text-muted-foreground">Manage your cigar lounges</p>
        </div>
        <Button asChild className="bg-amber-600 hover:bg-amber-700">
          <Link href="/add-lounge">
            <Plus className="mr-2 h-4 w-4" />
            Add Lounge
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Lounges
            </CardTitle>
            <Store className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lounges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Lounges</CardTitle>
              <CardDescription>Manage and track your listings</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/my-lounges">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : lounges && lounges.length > 0 ? (
            <div className="space-y-4">
              {lounges.slice(0, 5).map((lounge: any) => (
                <div
                  key={lounge.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {lounge.images?.[0] ? (
                      <img
                        src={lounge.images[0]}
                        alt={lounge.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-stone-100 flex items-center justify-center">
                        <Store className="h-6 w-6 text-stone-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{lounge.name}</h3>
                        {lounge.is_featured && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lounge.cities?.name || 'No city'} • {lounge.lounge_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(lounge.status)}
                    {lounge.subscription_status === 'active' && (
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Subscribed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-4 text-lg font-medium">No lounges yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first cigar lounge
              </p>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/add-lounge">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Lounge
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Upgrade Your Listing</CardTitle>
            <CardDescription>
              Get featured placement and attract more customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/billing">
                View Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Add Another Location</CardTitle>
            <CardDescription>
              Expand your presence with additional lounges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
              <Link href="/add-lounge">
                <Plus className="mr-2 h-4 w-4" />
                Add Lounge
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
