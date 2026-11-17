import { Request } from 'express';

// Extend Express Request to include authenticated user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Allowed Investment Categories according to Project Blueprint
export const VALID_INVESTMENT_CATEGORIES = [
  'Equity',
  'Mutual Funds',
  'Gold',
  'Fixed Deposits',
  'Other',
] as const;

export type InvestmentCategory = typeof VALID_INVESTMENT_CATEGORIES[number];

// Allowed Transaction Types
export const VALID_TRANSACTION_TYPES = ['BUY', 'SELL'] as const;
export type TransactionType = typeof VALID_TRANSACTION_TYPES[number];
