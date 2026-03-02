import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Users, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/config/api';

const BulkOperations = () => {
  const [userIds, setUserIds] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkUpdateRoles = async () => {
    const ids = userIds.split('\n').map(id => id.trim()).filter(Boolean);
    
    if (ids.length === 0) {
      toast({ title: 'Error', description: 'Please enter user IDs', variant: 'destructive' });
      return;
    }

    if (!selectedRole) {
      toast({ title: 'Error', description: 'Please select a role', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/superadmin/users/bulk-update-roles', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids, role: selectedRole })
      });
      toast({ title: 'Success', description: data.message });
      setUserIds('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update roles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = userIds.split('\n').map(id => id.trim()).filter(Boolean);
    
    if (ids.length === 0) {
      toast({ title: 'Error', description: 'Please enter user IDs', variant: 'destructive' });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${ids.length} users? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/superadmin/users/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
      });
      toast({ title: 'Success', description: data.message });
      setUserIds('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Bulk operations are powerful and irreversible. Use with extreme caution.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk User Operations
          </CardTitle>
          <CardDescription>Update roles or delete multiple users at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">User IDs (one per line)</label>
            <Textarea
              placeholder="Enter user IDs, one per line"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              rows={8}
              className="mt-2"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="COMPANY_HR">Company HR</SelectItem>
                  <SelectItem value="EVENT_HOST">Event Host</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleBulkUpdateRoles} disabled={loading}>
              <Users className="h-4 w-4 mr-2" />
              Update Roles
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperations;
