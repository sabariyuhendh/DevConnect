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
  logout,
  refreshToken
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema } from '../validations/authValidation';

const router = Router();

// Local authentication with validation
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.post('/refresh', protect, refreshToken);

// Username availability check
router.get('/check-username', checkUsername);

// GitHub OAuth
router.get('/github', githubOAuth);
router.get('/github/callback', githubCallback);

// Google OAuth
router.get('/google', googleOAuth);
router.get('/google/callback', googleCallback);

export default router;
