import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all transaction routes with authentication middleware
router.use(authenticateToken);

// Transaction Endpoints
router.get('/', getTransactions);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

export default router;
