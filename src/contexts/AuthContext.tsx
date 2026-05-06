'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; name: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('blog-token');
    if (savedToken) {
      setToken(savedToken);
      api.auth.me(savedToken)
        .then((u) => setUser(u as User))
        .catch(() => {
          localStorage.removeItem('blog-token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password) as { access_token: string; refresh_token: string };
    setToken(result.access_token);
    localStorage.setItem('blog-token', result.access_token);
    localStorage.setItem('blog-refresh-token', result.refresh_token);
    const u = await api.auth.me(result.access_token) as User;
    setUser(u);
  }, []);

  const register = useCallback(async (data: { email: string; name: string; password: string }) => {
    const result = await api.auth.register({ ...data, role: 'admin' }) as { access_token: string };
    setToken(result.access_token);
    localStorage.setItem('blog-token', result.access_token);
    const u = await api.auth.me(result.access_token) as User;
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('blog-token');
    localStorage.removeItem('blog-refresh-token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
