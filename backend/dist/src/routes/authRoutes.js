"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Local authentication
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.post('/logout', auth_1.protect, authController_1.logout);
router.get('/me', auth_1.protect, authController_1.me);
// Username availability check
router.get('/check-username', authController_1.checkUsername);
// GitHub OAuth
router.get('/github', authController_1.githubOAuth);
router.get('/github/callback', authController_1.githubCallback);
// Google OAuth
router.get('/google', authController_1.googleOAuth);
router.get('/google/callback', authController_1.googleCallback);
exports.default = router;
