import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, VALID_INVESTMENT_CATEGORIES } from '../types';

/**
 * GET /api/investments
 * Retrieves all investments belonging to the authenticated user.
 */
export const getInvestments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    res.status(200).json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

/**
 * GET /api/investments/:id
 * Retrieves a single investment by ID, strictly enforcing user ownership.
 */
export const getInvestmentById = async (
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

    // Backend Ownership Check: query includes userId so User A cannot read User B's investment
    const investment = await prisma.investment.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!investment) {
      res.status(404).json({ error: 'Investment not found or access denied' });
      return;
    }

    res.status(200).json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({ error: 'Failed to fetch investment details' });
  }
};

/**
 * POST /api/investments
 * Creates a new investment with manual valuation and manual validation.
 */
export const createInvestment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { name, category, investedAmount, currentValue, purchaseDate, description } = req.body;

    // --- MANUAL VALIDATION (Without external libraries like Zod) ---
    // 1. Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Investment name is required' });
      return;
    }

    // 2. Validate category against allowed list
    if (!category || !VALID_INVESTMENT_CATEGORIES.includes(category as any)) {
      res.status(400).json({
        error: `Invalid category. Must be one of: ${VALID_INVESTMENT_CATEGORIES.join(', ')}`,
      });
      return;
    }

    // 3. Validate invested amount: must be positive number
    const numInvested = Number(investedAmount);
    if (isNaN(numInvested) || numInvested <= 0) {
      res.status(400).json({ error: 'Invested amount must be a positive number greater than 0' });
      return;
    }

    // 4. Validate current value: must be non-negative number
    const numCurrent = Number(currentValue);
    if (isNaN(numCurrent) || numCurrent < 0) {
      res.status(400).json({ error: 'Current value must be a valid non-negative number' });
      return;
    }

    // 5. Validate purchase date
    const parsedDate = new Date(purchaseDate);
    if (!purchaseDate || isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Valid purchase date is required' });
      return;
    }

    // --- PRISMA INSERT ---
    const newInvestment = await prisma.investment.create({
      data: {
        userId,
        name: name.trim(),
        category,
        investedAmount: numInvested,
        currentValue: numCurrent,
        purchaseDate: parsedDate,
        description: description ? String(description).trim() : null,
      },
    });

    res.status(201).json(newInvestment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
};

/**
 * PUT /api/investments/:id
 * Updates an existing investment, verifying that the current user owns it.
 */
export const updateInvestment = async (
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

    // Ownership check: Find investment belonging to this user
    const existing = await prisma.investment.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Investment not found or access denied' });
      return;
    }

    const { name, category, investedAmount, currentValue, purchaseDate, description } = req.body;
    const updateData: any = {};

    // Validate and update fields if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Investment name cannot be empty' });
        return;
      }
      updateData.name = name.trim();
    }

    if (category !== undefined) {
      if (!VALID_INVESTMENT_CATEGORIES.includes(category as any)) {
        res.status(400).json({
          error: `Invalid category. Must be one of: ${VALID_INVESTMENT_CATEGORIES.join(', ')}`,
        });
        return;
      }
      updateData.category = category;
    }

    if (investedAmount !== undefined) {
      const numInvested = Number(investedAmount);
      if (isNaN(numInvested) || numInvested <= 0) {
        res.status(400).json({ error: 'Invested amount must be a positive number greater than 0' });
        return;
      }
      updateData.investedAmount = numInvested;
    }

    if (currentValue !== undefined) {
      const numCurrent = Number(currentValue);
      if (isNaN(numCurrent) || numCurrent < 0) {
        res.status(400).json({ error: 'Current value must be a valid non-negative number' });
        return;
      }
      updateData.currentValue = numCurrent;
    }

    if (purchaseDate !== undefined) {
      const parsedDate = new Date(purchaseDate);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: 'Valid purchase date is required' });
        return;
      }
      updateData.purchaseDate = parsedDate;
    }

    if (description !== undefined) {
      updateData.description = description ? String(description).trim() : null;
    }

    const updated = await prisma.investment.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ error: 'Failed to update investment' });
  }
};

/**
 * DELETE /api/investments/:id
 * Deletes an investment and cascades deletion to all its transactions.
 */
export const deleteInvestment = async (
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

    // Ownership check before deletion
    const existing = await prisma.investment.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Investment not found or access denied' });
      return;
    }

    // Delete investment (Prisma cascading delete handles child transactions automatically)
    await prisma.investment.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Investment deleted successfully', id });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
};
