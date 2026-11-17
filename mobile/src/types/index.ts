// Common TypeScript definitions for PocketPortfolio Mobile

export type InvestmentCategory = 'Equity' | 'Mutual Funds' | 'Gold' | 'Fixed Deposits' | 'Other';
export type TransactionType = 'BUY' | 'SELL';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  category: InvestmentCategory;
  investedAmount: number | string;
  currentValue: number | string;
  purchaseDate: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    transactions: number;
  };
}

export interface Transaction {
  id: string;
  investmentId: string;
  type: TransactionType;
  amount: number | string;
  transactionDate: string;
  description?: string | null;
  createdAt?: string;
  investment?: {
    id: string;
    name: string;
    category: InvestmentCategory;
  };
}

export interface CategoryAllocation {
  category: string;
  value: number;
  percentage: number;
}

export interface DashboardSummary {
  totalPortfolioValue: number;
  totalInvestedAmount: number;
  totalProfitLoss: number;
  returnPercentage: number;
  investmentCount: number;
  categoryAllocation: CategoryAllocation[];
  recentInvestments: Investment[];
  recentTransactions: Transaction[];
}

// Navigation Parameter Lists
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  AddInvestment: { investment?: Investment } | undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Investments: undefined;
  Transactions: undefined;
  Profile: undefined;
};
