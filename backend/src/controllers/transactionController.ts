import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, VALID_TRANSACTION_TYPES } from '../types';

/**
 * GET /api/transactions
 * Retrieves all transactions belonging to investments owned by the authenticated user.
 */
export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Optional query param to filter by specific investment
    const { investmentId } = req.query;

    const whereClause: any = {
      investment: {
        userId, // Critical ownership check: only transactions for investments owned by this user
      },
    };

    if (investmentId && typeof investmentId === 'string') {
      whereClause.investmentId = investmentId;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/**
 * POST /api/transactions
 * Records a BUY or SELL transaction for an investment owned by the authenticated user.
 */
export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { investmentId, type, amount, transactionDate, description } = req.body;

    // --- MANUAL VALIDATION ---
    if (!investmentId || typeof investmentId !== 'string') {
      res.status(400).json({ error: 'Valid investment ID is required' });
      return;
    }

    // Verify investment ownership: User A cannot add a transaction to User B's investment
    const investment = await prisma.investment.findFirst({
      where: { id: investmentId, userId },
    });

    if (!investment) {
      res.status(404).json({ error: 'Associated investment not found or access denied' });
      return;
    }

    // Validate type (BUY or SELL)
    if (!type || !VALID_TRANSACTION_TYPES.includes(type)) {
      res.status(400).json({
        error: `Transaction type must be one of: ${VALID_TRANSACTION_TYPES.join(', ')}`,
      });
      return;
    }

    // Validate positive amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Transaction amount must be a positive number greater than 0' });
      return;
    }

    // Validate date
    const parsedDate = new Date(transactionDate);
    if (!transactionDate || isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Valid transaction date is required' });
      return;
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        investmentId,
        type,
        amount: numAmount,
        transactionDate: parsedDate,
        description: description ? String(description).trim() : null,
      },
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
};

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction, verifying ownership through its parent investment.
 */
export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Ownership check via parent investment
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        investment: { userId },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Transaction not found or access denied' });
      return;
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Transaction deleted successfully', id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
