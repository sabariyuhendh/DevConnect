import { Router } from 'express';
import {
  getProfile,
  getMyProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverPicture,
  updatePreferences,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
} from '../controllers/profileController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  updateProfilePictureSchema,
  updateCoverPictureSchema,
  updatePreferencesSchema
} from '../validations/profileValidation';

const router = Router();

// Search users (public)
router.get('/search', searchUsers);

// Get current user's profile (protected)
router.get('/me', protect, getMyProfile);

// Update current user's profile (protected)
router.put('/me', protect, validate(updateProfileSchema), updateProfile);

// Update profile picture (protected)
router.put('/me/picture', protect, validate(updateProfilePictureSchema), updateProfilePicture);

// Update cover picture (protected)
router.put('/me/cover', protect, validate(updateCoverPictureSchema), updateCoverPicture);

// Update preferences (protected)
router.put('/me/preferences', protect, validate(updatePreferencesSchema), updatePreferences);

// Get user profile by username (public/protected)
router.get('/:username', getProfile);

// Get user's followers
router.get('/:username/followers', getFollowers);

// Get user's following
router.get('/:username/following', getFollowing);

// Follow/unfollow user (protected)
router.post('/:username/follow', protect, followUser);
router.delete('/:username/follow', protect, unfollowUser);

export default router;
