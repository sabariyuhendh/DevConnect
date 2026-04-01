import { Router } from 'express';
import { protect } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/security';
import {
  profilePictureUpload,
  coverPhotoUpload,
  postImageUpload,
  resumeUpload,
  eventImageUpload,
  handleMulterError,
  serveFile
} from '../utils/fileUpload';
import * as uploadController from '../controllers/uploadController';

const router = Router();

// File serving endpoint (public)
router.get('/files/:subDir/:filename', serveFile);

// All upload routes require authentication and rate limiting
router.use(protect, uploadRateLimiter);

// Profile picture upload
router.post('/profile-picture', 
  profilePictureUpload.single('image'),
  handleMulterError,
  uploadController.uploadProfilePicture
);

// Cover photo upload
router.post('/cover-photo',
  coverPhotoUpload.single('image'),
  handleMulterError,
  uploadController.uploadCoverPhoto
);

// Post image upload
router.post('/post-image',
  postImageUpload.single('image'),
  handleMulterError,
  uploadController.uploadPostImage
);

// Resume upload
router.post('/resume',
  resumeUpload.single('document'),
  handleMulterError,
  uploadController.uploadResume
);

// Event image upload
router.post('/event-image',
  eventImageUpload.single('image'),
  handleMulterError,
  uploadController.uploadEventImage
);

export default router;