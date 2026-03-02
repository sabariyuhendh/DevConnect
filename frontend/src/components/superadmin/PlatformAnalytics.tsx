import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp } from 'lucide-react';
import { apiRequest } from '@/config/api';

const PlatformAnalytics = () => {
  const [days, setDays] = useState('30');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest(`/api/superadmin/stats/analytics?days=${days}`, {
        method: 'GET'
      });
      setAnalytics(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Analytics
            </CardTitle>
            <CardDescription>Growth trends and activity metrics</CardDescription>
          </div>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : analytics ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">New Users</p>
              <p className="text-3xl font-bold">{analytics.newUsers}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">New Posts</p>
              <p className="text-3xl font-bold">{analytics.newPosts}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">New Jobs</p>
              <p className="text-3xl font-bold">{analytics.newJobs}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold">{analytics.activeUsers}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformAnalytics;
