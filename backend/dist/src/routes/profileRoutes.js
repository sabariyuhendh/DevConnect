"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const profileValidation_1 = require("../validations/profileValidation");
const router = (0, express_1.Router)();
// Search users (public)
router.get('/search', profileController_1.searchUsers);
// Get current user's profile (protected)
router.get('/me', auth_1.protect, profileController_1.getMyProfile);
// Update current user's profile (protected)
router.put('/me', auth_1.protect, (0, validate_1.validate)(profileValidation_1.updateProfileSchema), profileController_1.updateProfile);
// Update profile picture (protected)
router.put('/me/picture', auth_1.protect, (0, validate_1.validate)(profileValidation_1.updateProfilePictureSchema), profileController_1.updateProfilePicture);
// Update cover picture (protected)
router.put('/me/cover', auth_1.protect, (0, validate_1.validate)(profileValidation_1.updateCoverPictureSchema), profileController_1.updateCoverPicture);
// Update preferences (protected)
router.put('/me/preferences', auth_1.protect, (0, validate_1.validate)(profileValidation_1.updatePreferencesSchema), profileController_1.updatePreferences);
// Get user profile by username (public/protected)
router.get('/:username', profileController_1.getProfile);
// Get user's followers
router.get('/:username/followers', profileController_1.getFollowers);
// Get user's following
router.get('/:username/following', profileController_1.getFollowing);
// Follow/unfollow user (protected)
router.post('/:username/follow', auth_1.protect, profileController_1.followUser);
router.delete('/:username/follow', auth_1.protect, profileController_1.unfollowUser);
exports.default = router;
