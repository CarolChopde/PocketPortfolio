import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes (no token required)
router.post('/register', register);
router.post('/login', login);

// Protected route (requires valid JWT token)
router.get('/me', authenticateToken, getMe);

export default router;
