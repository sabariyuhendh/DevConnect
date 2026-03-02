import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SystemStatsProps {
  stats: {
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
  } | null;
}

const SystemStats = ({ stats }: SystemStatsProps) => {
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Statistics
          </CardTitle>
          <CardDescription>Breakdown of users by role and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">By Status</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Badge variant="outline" className="bg-green-50">
                    {stats.users.active}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Inactive</span>
                  <Badge variant="outline" className="bg-red-50">
                    {stats.users.inactive}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">By Role</p>
              <div className="space-y-1">
                {Object.entries(stats.users.byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {role.replace('_', ' ')}
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Growth</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last 7 days</span>
                  <Badge variant="secondary">{stats.users.recentSignups}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Statistics
          </CardTitle>
          <CardDescription>Job postings and application metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-medium">Pending</p>
              </div>
              <p className="text-2xl font-bold">{stats.jobs.pending}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Approved</p>
              </div>
              <p className="text-2xl font-bold">{stats.jobs.approved}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-medium">Rejected</p>
              </div>
              <p className="text-2xl font-bold">{stats.jobs.rejected}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">Applications</p>
              </div>
              <p className="text-2xl font-bold">{stats.jobs.totalApplications}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Statistics
          </CardTitle>
          <CardDescription>Platform content metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Posts</span>
              <Badge variant="secondary" className="text-lg">
                {stats.content.totalPosts}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStats;
