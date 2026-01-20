'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Store,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}

function StatsCard({ title, value, description, icon: Icon, trend, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-amber-100 rounded-full">
          <Icon className="h-4 w-4 text-amber-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const COLORS = ['#d97706', '#78716c', '#0891b2', '#7c3aed', '#059669'];

export default function Dashboard() {
  const supabase = createClient();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalLounges },
        { count: pendingLounges },
        { count: approvedLounges },
        { count: activeSubscriptions },
        { data: payments },
        { data: cities },
        { data: loungesByType },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('lounges').select('*', { count: 'exact', head: true }),
        supabase.from('lounges').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('lounges').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('lounges').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
        supabase.from('payments').select('amount, created_at').eq('status', 'succeeded'),
        supabase.from('cities').select('name, id'),
        supabase.from('lounges').select('lounge_type').eq('status', 'approved'),
      ]);

      // Calculate MRR (sum of all successful payments in last 30 days, annualized)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPayments = payments?.filter(
        (p) => new Date(p.created_at) >= thirtyDaysAgo
      ) || [];
      const mrr = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

      // Count lounges by type
      const typeCount: Record<string, number> = {};
      loungesByType?.forEach((l) => {
        const type = l.lounge_type || 'Unknown';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      return {
        totalUsers: totalUsers || 0,
        totalLounges: totalLounges || 0,
        pendingLounges: pendingLounges || 0,
        approvedLounges: approvedLounges || 0,
        activeSubscriptions: activeSubscriptions || 0,
        mrr,
        cities: cities || [],
        loungesByType: Object.entries(typeCount).map(([name, value]) => ({ name, value })),
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  // Fetch lounges by city for bar chart
  const { data: loungesByCity } = useQuery({
    queryKey: ['lounges-by-city'],
    queryFn: async () => {
      const { data: lounges } = await supabase
        .from('lounges')
        .select('city_id, cities(name)')
        .eq('status', 'approved');

      const cityCount: Record<string, number> = {};
      lounges?.forEach((l: any) => {
        const cityName = l.cities?.name || 'Unknown';
        cityCount[cityName] = (cityCount[cityName] || 0) + 1;
      });

      return Object.entries(cityCount)
        .map(([name, lounges]) => ({ name, lounges }))
        .sort((a, b) => b.lounges - a.lounges)
        .slice(0, 6);
    },
  });

  // Mock data for trend charts (would come from time-series queries in production)
  const signupTrend = [
    { name: 'Week 1', users: 4 },
    { name: 'Week 2', users: 7 },
    { name: 'Week 3', users: 5 },
    { name: 'Week 4', users: 12 },
  ];

  const revenueTrend = [
    { name: 'Jan', revenue: 2400 },
    { name: 'Feb', revenue: 3600 },
    { name: 'Mar', revenue: 3200 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 4800 },
    { name: 'Jun', revenue: 5200 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your cigar directory platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          description="Registered users"
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Lounges"
          value={stats?.totalLounges || 0}
          description={`${stats?.approvedLounges || 0} approved, ${stats?.pendingLounges || 0} pending`}
          icon={Store}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          description="Paying lounges"
          icon={CreditCard}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats?.mrr || 0).toLocaleString()}`}
          description="Last 30 days"
          icon={DollarSign}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ fill: '#d97706' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lounges by City */}
        <Card>
          <CardHeader>
            <CardTitle>Lounges by City</CardTitle>
            <CardDescription>Distribution of approved lounges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loungesByCity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="lounges" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Signups */}
        <Card>
          <CardHeader>
            <CardTitle>User Signups</CardTitle>
            <CardDescription>New users over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#0891b2"
                    strokeWidth={2}
                    dot={{ fill: '#0891b2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lounges by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Lounges by Type</CardTitle>
            <CardDescription>Breakdown of lounge categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.loungesByType || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(stats?.loungesByType || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Pending Approvals */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50"
                  >
                    <div className="p-2 bg-stone-100 rounded-full">
                      <Clock className="h-4 w-4 text-stone-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.profiles?.full_name || activity.profiles?.email || 'System'} •{' '}
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Lounge Status</CardTitle>
            <CardDescription>Current approval status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Pending Review</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {stats?.pendingLounges || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Approved</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {stats?.approvedLounges || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium">Rejected</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {(stats?.totalLounges || 0) - (stats?.approvedLounges || 0) - (stats?.pendingLounges || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
