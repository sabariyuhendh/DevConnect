import { Router } from 'express';
import { protect, requireSuperAdmin } from '../middleware/auth';
import {
  getAllAdmins,
  bulkUpdateRoles,
  deleteUser,
  getSystemStats,
  bulkDeleteUsers,
  getAllJobs,
  deleteJob,
  bulkDeleteJobs,
  getPlatformAnalytics,
  clearActivityLogs,
  getUserDetails,
  toggleUserVerification,
  getDatabaseStats,
} from '../controllers/superAdminController';

const router = Router();

// All super admin routes require authentication and super admin role
router.use(protect, requireSuperAdmin);

// Admin Management
router.get('/admins', getAllAdmins);

// User Management
router.get('/users/:userId/details', getUserDetails);
router.delete('/users/:userId', deleteUser);
router.post('/users/bulk-delete', bulkDeleteUsers);
router.post('/users/bulk-update-roles', bulkUpdateRoles);
router.patch('/users/:userId/verify', toggleUserVerification);

// Job Management
router.get('/jobs', getAllJobs);
router.delete('/jobs/:jobId', deleteJob);
router.post('/jobs/bulk-delete', bulkDeleteJobs);

// System Statistics
router.get('/stats/system', getSystemStats);
router.get('/stats/database', getDatabaseStats);
router.get('/stats/analytics', getPlatformAnalytics);

// Maintenance
router.post('/maintenance/clear-logs', clearActivityLogs);

export default router;
