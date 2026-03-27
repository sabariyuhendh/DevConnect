"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const superAdminController_1 = require("../controllers/superAdminController");
const router = (0, express_1.Router)();
// All super admin routes require authentication and super admin role
router.use(auth_1.protect, auth_1.requireSuperAdmin);
// Admin Management
router.get('/admins', superAdminController_1.getAllAdmins);
// User Management
router.get('/users/:userId/details', superAdminController_1.getUserDetails);
router.delete('/users/:userId', superAdminController_1.deleteUser);
router.post('/users/bulk-delete', superAdminController_1.bulkDeleteUsers);
router.post('/users/bulk-update-roles', superAdminController_1.bulkUpdateRoles);
router.patch('/users/:userId/verify', superAdminController_1.toggleUserVerification);
// Job Management
router.get('/jobs', superAdminController_1.getAllJobs);
router.delete('/jobs/:jobId', superAdminController_1.deleteJob);
router.post('/jobs/bulk-delete', superAdminController_1.bulkDeleteJobs);
// System Statistics
router.get('/stats/system', superAdminController_1.getSystemStats);
router.get('/stats/database', superAdminController_1.getDatabaseStats);
router.get('/stats/analytics', superAdminController_1.getPlatformAnalytics);
// Maintenance
router.post('/maintenance/clear-logs', superAdminController_1.clearActivityLogs);
exports.default = router;
