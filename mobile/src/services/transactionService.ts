import { apiRequest } from './api';
import { Transaction, TransactionType } from '../types';

export interface CreateTransactionInput {
  investmentId: string;
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string;
}

export const transactionService = {
  // Get all user transactions (optionally filtered by investment)
  async getTransactions(investmentId?: string): Promise<Transaction[]> {
    const endpoint = investmentId
      ? `/api/transactions?investmentId=${investmentId}`
      : '/api/transactions';
    return apiRequest<Transaction[]>(endpoint, {
      method: 'GET',
    });
  },

  // Record BUY or SELL transaction
  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    return apiRequest<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<{ message: string; id: string }> {
    return apiRequest<{ message: string; id: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};
