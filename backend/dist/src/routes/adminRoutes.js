"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.protect, auth_1.requireAdmin);
// Dashboard
router.get('/dashboard/stats', adminController_1.getDashboardStats);
// User management
router.get('/users', adminController_1.getUsers);
router.patch('/users/:userId/role', auth_1.requireSuperAdmin, adminController_1.updateUserRole);
router.patch('/users/:userId/status', adminController_1.toggleUserStatus);
// Job management
router.get('/jobs/pending', adminController_1.getPendingJobs);
router.patch('/jobs/:jobId/status', adminController_1.updateJobStatus);
// Activity logs
router.get('/activity-logs', adminController_1.getActivityLogs);
exports.default = router;
