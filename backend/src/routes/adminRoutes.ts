import { Router } from 'express';
import { protect, requireAdmin, requireSuperAdmin } from '../middleware/auth';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getPendingJobs,
  updateJobStatus,
  getActivityLogs,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:userId/role', requireSuperAdmin, updateUserRole);
router.patch('/users/:userId/status', toggleUserStatus);

// Job management
router.get('/jobs/pending', getPendingJobs);
router.patch('/jobs/:jobId/status', updateJobStatus);

// Activity logs
router.get('/activity-logs', getActivityLogs);

export default router;
