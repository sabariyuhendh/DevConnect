import { Router } from 'express';
import { login, me, signup } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, me);

export default router;
