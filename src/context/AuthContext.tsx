import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, User, ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.roles?.includes('admin') ?? false;

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await api.getMe();
      setUser(user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token } = await api.login(email, password);
      localStorage.setItem('auth_token', token);

      // Всегда подтягиваем актуального пользователя с ролями через /me,
      // чтобы не зависеть от формы ответа /login.
      const { user } = await api.getMe();
      setUser(user);
    } catch (error) {
      localStorage.removeItem('auth_token');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { token } = await api.register(email, password, name);
      localStorage.setItem('auth_token', token);
      const { user } = await api.getMe();
      setUser(user);
    } catch (error) {
      localStorage.removeItem('auth_token');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
