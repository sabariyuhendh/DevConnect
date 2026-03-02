import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2 } from 'lucide-react';
import { apiRequest } from '@/config/api';

const DatabaseManagement = () => {
  const [dbStats, setDbStats] = useState<any>(null);
  const [logDays, setLogDays] = useState('90');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      const data = await apiRequest('/api/superadmin/stats/database', {
        method: 'GET'
      });
      setDbStats(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load database stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm(`Delete activity logs older than ${logDays} days?`)) return;

    try {
      const data = await apiRequest('/api/superadmin/maintenance/clear-logs', {
        method: 'POST',
        body: JSON.stringify({ olderThan: logDays })
      });
      toast({ title: 'Success', description: data.message });
      fetchDatabaseStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear logs',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>Current database table counts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : dbStats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(dbStats.tables).map(([table, count]) => (
                <div key={table} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    {table}
                  </p>
                  <p className="text-2xl font-bold">{count as number}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Maintenance Operations
          </CardTitle>
          <CardDescription>Clean up old data and optimize database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Clear logs older than (days)</label>
              <Input
                type="number"
                value={logDays}
                onChange={(e) => setLogDays(e.target.value)}
                className="mt-2"
                min="1"
              />
            </div>
            <Button variant="destructive" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Old Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManagement;
