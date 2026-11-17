import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect dashboard route with authentication middleware
router.use(authenticateToken);

// GET /api/dashboard/summary
router.get('/summary', getDashboardSummary);

export default router;
