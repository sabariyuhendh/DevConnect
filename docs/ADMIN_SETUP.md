# Admin Dashboard Setup Guide

## Overview
The admin dashboard provides role-based access control for managing users, approving job postings, and monitoring system activity.

## User Roles

### 1. USER (Default)
- Regular user with standard platform access
- Can create posts, apply for jobs, attend events

### 2. COMPANY_HR
- Can post job listings
- Job postings require admin approval
- Access to company-specific features

### 3. EVENT_HOST
- Can create and manage events
- Event hosting capabilities
- Access to event analytics

### 4. ADMIN
- Full access to admin dashboard
- Can manage users (except role changes)
- Can approve/reject job postings
- Can view activity logs
- Cannot assign SUPER_ADMIN role

### 5. SUPER_ADMIN
- Highest level of access
- Can assign any role including SUPER_ADMIN
- Full system control
- Can manage all users and content

## Database Migration

Run the migration to add the role field to the User table:

```bash
cd backend
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

## Setting Up Your First Admin

### Option 1: Direct Database Update
```sql
UPDATE "User" 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-email@example.com';
```

### Option 2: Using Prisma Studio
```bash
cd backend
npx prisma studio
```
Then navigate to the User model and update the role field.

## Accessing the Admin Dashboard

1. Login with an account that has ADMIN or SUPER_ADMIN role
2. Navigate to `/admin` in your browser
3. You'll see the admin dashboard with:
   - Dashboard statistics
   - User management
   - Job approval queue
   - Activity logs

## API Endpoints

### Admin Routes (Protected)
All routes require authentication and admin role.

#### Dashboard Stats
```
GET /api/admin/dashboard/stats
```

#### User Management
```
GET /api/admin/users?page=1&limit=20&search=query&role=ADMIN
PATCH /api/admin/users/:userId/role (SUPER_ADMIN only)
PATCH /api/admin/users/:userId/status
```

#### Job Management
```
GET /api/admin/jobs/pending
PATCH /api/admin/jobs/:jobId/status
```

#### Activity Logs
```
GET /api/admin/activity-logs?page=1&limit=50
```

## Frontend Components

### AdminDashboard
Main dashboard page with stats and tabs for different management sections.

### UserManagement
- Search and filter users
- Change user roles (SUPER_ADMIN only)
- Activate/deactivate user accounts

### JobApproval
- View pending job postings
- Approve or reject jobs
- View job details

### ActivityLogs
- Monitor system activity
- Track user actions
- View IP addresses and timestamps

## Security Features

1. **Role-based middleware**: `requireAdmin`, `requireSuperAdmin`
2. **Protected routes**: All admin routes require authentication
3. **Permission checks**: Frontend checks user role before showing admin links
4. **Audit logging**: All admin actions are logged

## Testing

### Test Admin Access
1. Create a test user
2. Update their role to ADMIN
3. Login and navigate to `/admin`
4. Verify access to dashboard

### Test Role Restrictions
1. Try accessing admin routes with USER role
2. Should receive 403 Forbidden error
3. Try assigning SUPER_ADMIN role as ADMIN
4. Should be denied

## Troubleshooting

### "Access Denied" Error
- Verify user role in database
- Check JWT token includes user role
- Ensure middleware is properly configured

### Admin Route Not Found
- Verify backend server is running
- Check adminRoutes is imported in server.ts
- Verify route is registered: `app.use('/api/admin', adminRoutes)`

### Role Not Updating
- Clear browser cache and localStorage
- Re-login to get fresh JWT token
- Verify database migration ran successfully

## Best Practices

1. **Limit SUPER_ADMIN accounts**: Only assign to trusted administrators
2. **Regular audits**: Review activity logs regularly
3. **Role assignment**: Use principle of least privilege
4. **Monitor job approvals**: Review pending jobs promptly
5. **User management**: Deactivate instead of delete when possible

## Future Enhancements

- [ ] Event approval workflow
- [ ] Content moderation tools
- [ ] Advanced analytics dashboard
- [ ] Bulk user operations
- [ ] Email notifications for admin actions
- [ ] Role-based permissions customization
