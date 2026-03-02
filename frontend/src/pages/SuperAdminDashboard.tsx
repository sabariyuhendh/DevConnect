import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Database, TrendingUp, Users, Briefcase, Activity } from 'lucide-react';
import SystemStats from '@/components/superadmin/SystemStats';
import AdminManagement from '@/components/superadmin/AdminManagement';
import BulkOperations from '@/components/superadmin/BulkOperations';
import PlatformAnalytics from '@/components/superadmin/PlatformAnalytics';
import DatabaseManagement from '@/components/superadmin/DatabaseManagement';
import { apiRequest } from '@/config/api';

interface SystemStatsData {
  users: {
    total: number;
    active: number;
    inactive: number;
    recentSignups: number;
    byRole: Record<string, number>;
  };
  content: {
    totalPosts: number;
  };
  jobs: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalApplications: number;
  };
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<SystemStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const data = await apiRequest('/api/superadmin/stats/system', {
        method: 'GET'
      });
      setStats(data.data);
    } catch (error: any) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        toast({
          title: 'Access Denied',
          description: 'You do not have super admin permissions',
          variant: 'destructive',
        });
        navigate('/admin');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load system stats',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Advanced system management and analytics</p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Super Admin
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users.active || 0} active, {stats?.users.inactive || 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.recentSignups || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.jobs.pending || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Total job applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">System Stats</TabsTrigger>
          <TabsTrigger value="admins">Admin Management</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <SystemStats stats={stats} />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <AdminManagement />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <BulkOperations />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PlatformAnalytics />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
