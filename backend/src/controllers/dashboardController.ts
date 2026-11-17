import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, VALID_INVESTMENT_CATEGORIES } from '../types';

/**
 * GET /api/dashboard/summary
 * Calculates and returns portfolio analytics for the authenticated user:
 * - Total portfolio value
 * - Total invested amount
 * - Total profit/loss and return percentage
 * - Investment count
 * - Category-wise breakdown (for pie charts)
 * - Recent investments and transactions
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // 1. Fetch all user investments
    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch the 5 most recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        investment: { userId },
      },
      take: 5,
      orderBy: { transactionDate: 'desc' },
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

    // 3. Compute portfolio totals using accurate numbers
    let totalInvested = 0;
    let totalCurrentValue = 0;

    // Track category values for asset allocation chart
    const categoryTotals: Record<string, number> = {};
    for (const cat of VALID_INVESTMENT_CATEGORIES) {
      categoryTotals[cat] = 0;
    }

    for (const inv of investments) {
      const invested = Number(inv.investedAmount);
      const current = Number(inv.currentValue);

      totalInvested += invested;
      totalCurrentValue += current;

      if (categoryTotals[inv.category] !== undefined) {
        categoryTotals[inv.category] += current;
      } else {
        categoryTotals[inv.category] = current;
      }
    }

    // Profit / Loss calculation: Current Value - Invested Amount
    const totalProfitLoss = totalCurrentValue - totalInvested;

    // Return percentage: (P&L / Invested) * 100 (Safe division by zero check)
    const returnPercentage =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Category allocation array with percentage
    const categoryAllocation = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        category,
        value: Number(value.toFixed(2)),
        percentage:
          totalCurrentValue > 0
            ? Number(((value / totalCurrentValue) * 100).toFixed(2))
            : 0,
      }));

    res.status(200).json({
      totalPortfolioValue: Number(totalCurrentValue.toFixed(2)),
      totalInvestedAmount: Number(totalInvested.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      returnPercentage: Number(returnPercentage.toFixed(2)),
      investmentCount: investments.length,
      categoryAllocation,
      recentInvestments: investments.slice(0, 5),
      recentTransactions,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard summary' });
  }
};
