import { Router } from 'express';
import {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from '../controllers/investmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all investment routes with authentication middleware
router.use(authenticateToken);

// CRUD Endpoints
router.get('/', getInvestments);
router.get('/:id', getInvestmentById);
router.post('/', createInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;
