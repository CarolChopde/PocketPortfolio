import { apiRequest } from './api';
import { Investment, DashboardSummary, InvestmentCategory } from '../types';

export interface CreateInvestmentInput {
  name: string;
  category: InvestmentCategory;
  investedAmount: number;
  currentValue: number;
  purchaseDate: string;
  description?: string;
}

export interface UpdateInvestmentInput {
  name?: string;
  category?: InvestmentCategory;
  investedAmount?: number;
  currentValue?: number;
  purchaseDate?: string;
  description?: string;
}

export const investmentService = {
  // Get all investments for current user
  async getInvestments(): Promise<Investment[]> {
    return apiRequest<Investment[]>('/api/investments', {
      method: 'GET',
    });
  },

  // Get single investment with transactions
  async getInvestmentById(id: string): Promise<Investment> {
    return apiRequest<Investment>(`/api/investments/${id}`, {
      method: 'GET',
    });
  },

  // Add new investment
  async createInvestment(data: CreateInvestmentInput): Promise<Investment> {
    return apiRequest<Investment>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing investment
  async updateInvestment(id: string, data: UpdateInvestmentInput): Promise<Investment> {
    return apiRequest<Investment>(`/api/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete investment
  async deleteInvestment(id: string): Promise<{ message: string; id: string }> {
    return apiRequest<{ message: string; id: string }>(`/api/investments/${id}`, {
      method: 'DELETE',
    });
  },

  // Get aggregated dashboard analytics
  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>('/api/dashboard/summary', {
      method: 'GET',
    });
  },
};
