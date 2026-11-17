import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { getToken, saveToken, deleteToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, confirm: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Always require manual login on app launch (do not auto-login)
  useEffect(() => {
    const resetSessionOnLaunch = async () => {
      try {
        await deleteToken();
      } catch (error) {
        console.log('Session reset on launch:', error);
      } finally {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    };

    resetSessionOnLaunch();
  }, []);

  // Login handler
  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  // Register handler
  const register = async (name: string, email: string, pass: string, confirm: string) => {
    const res = await authService.register(name, email, pass, confirm);
    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  // Logout handler
  const logout = async () => {
    await deleteToken();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
