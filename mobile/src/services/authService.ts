import { apiRequest } from './api';
import { User } from '../types';

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  // Register a new user
  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  },

  // Log in existing user
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current logged-in user details using stored JWT
  async getMe(): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/api/auth/me', {
      method: 'GET',
    });
  },
};
