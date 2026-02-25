import { Router } from 'express';
import {
  login,
  me,
  signup,
  checkUsername,
  githubOAuth,
  githubCallback,
  googleOAuth,
  googleCallback,
  logout
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Local authentication
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

// Username availability check
router.get('/check-username', checkUsername);

// GitHub OAuth
router.get('/github', githubOAuth);
router.get('/github/callback', githubCallback);

// Google OAuth
router.get('/google', googleOAuth);
router.get('/google/callback', googleCallback);

export default router;
