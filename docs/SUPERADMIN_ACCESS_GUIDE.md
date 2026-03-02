# Super Admin Access Guide

## Problem
You're getting 401 Unauthorized errors when accessing the Super Admin Dashboard because your user account doesn't have the `SUPER_ADMIN` role.

## Solution

### Step 1: Create a User Account (if you haven't already)
1. Go to the signup page and create a regular user account
2. Complete the registration process
3. Note down the email address you used

### Step 2: Promote User to Super Admin

Run the admin creation script from the backend directory:

```bash
cd backend
npm run create-admin
```

### Step 3: Follow the Interactive Prompts

The script will ask you for:

1. **Email address**: Enter the email of the user you want to promote
   ```
   Enter user email: your-email@example.com
   ```

2. **Role selection**: Choose option 5 for SUPER_ADMIN
   ```
   Available roles:
     1. USER
     2. COMPANY_HR
     3. EVENT_HOST
     4. ADMIN
     5. SUPER_ADMIN
   
   Select role (1-5): 5
   ```

3. **Confirmation**: Type `yes` to confirm
   ```
   Update username to SUPER_ADMIN? (yes/no): yes
   ```

### Step 4: Verify the Change

You should see a success message:
```
✅ Successfully updated username to SUPER_ADMIN

The user can now access the admin dashboard at /admin
```

### Step 5: Log Out and Log Back In

1. Log out from your current session
2. Log back in with the same credentials
3. Your JWT token will now include the SUPER_ADMIN role
4. Navigate to `/superadmin` to access the Super Admin Dashboard

## Role Hierarchy

- **USER**: Regular user with basic access
- **COMPANY_HR**: Can post jobs
- **EVENT_HOST**: Can create and manage events
- **ADMIN**: Can approve jobs, manage users, view activity logs
- **SUPER_ADMIN**: Full system access including:
  - All admin capabilities
  - Manage other admins
  - Bulk operations (delete users, jobs)
  - System statistics and analytics
  - Database management
  - Platform-wide maintenance

## Troubleshooting

### Still Getting 401 Errors?

1. **Clear browser cache and cookies**
   - The old JWT token might be cached

2. **Check localStorage**
   - Open browser DevTools (F12)
   - Go to Application > Local Storage
   - Delete the `token` key
   - Log in again

3. **Verify role in database**
   ```bash
   cd backend
   npx prisma studio
   ```
   - Open the User table
   - Find your user
   - Verify the `role` field shows `SUPER_ADMIN`

4. **Check backend logs**
   - Look for authentication errors in the backend console
   - Verify the JWT token is being sent with requests

### Creating Multiple Admins

You can run the script multiple times to promote different users:

```bash
# Promote user 1 to SUPER_ADMIN
npm run create-admin

# Promote user 2 to ADMIN
npm run create-admin
```

## API Endpoints Requiring Super Admin

The following endpoints require `SUPER_ADMIN` role:

- `GET /api/superadmin/stats/system` - System statistics
- `GET /api/superadmin/stats/database` - Database statistics
- `GET /api/superadmin/stats/analytics` - Platform analytics
- `GET /api/superadmin/admins` - List all admins
- `GET /api/superadmin/users/:userId/details` - User details
- `DELETE /api/superadmin/users/:userId` - Delete user
- `POST /api/superadmin/users/bulk-delete` - Bulk delete users
- `POST /api/superadmin/users/bulk-update-roles` - Bulk update roles
- `GET /api/superadmin/jobs` - All jobs (including rejected)
- `DELETE /api/superadmin/jobs/:jobId` - Delete job
- `POST /api/superadmin/jobs/bulk-delete` - Bulk delete jobs
- `POST /api/superadmin/maintenance/clear-logs` - Clear activity logs

## Security Notes

- Only promote trusted users to SUPER_ADMIN
- Super admins cannot be deleted through the UI
- Super admins can perform destructive operations
- All super admin actions should be logged and monitored
- Consider implementing 2FA for super admin accounts in production

## Quick Reference

```bash
# Navigate to backend
cd backend

# Run admin creation script
npm run create-admin

# Alternative: Direct execution
npx ts-node scripts/create-admin.ts

# View database in browser
npx prisma studio
```
