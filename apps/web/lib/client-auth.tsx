'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from './api-client';

// User type
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  orgId?: string | null;
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<AuthUser>('/auth/me');
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<AuthUser>('/auth/login', { email, password });
    
    if (response.data) {
      setUser(response.data);
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Login failed' };
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    window.location.href = '/';
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      await refreshUser();
      setLoading(false);
    };
    checkAuth();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to check if user has role
export function hasRole(user: AuthUser | null, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

// Helper to check if user has any of the roles
export function hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
}

// Role constants
export const ROLES = {
  FEDERATION_ADMIN: 'federation_admin',
  CLUB_ADMIN: 'club_admin',
  DTN: 'dtn',
  FINANCE: 'finance',
  STOCK: 'stock',
  MEDECIN: 'medecin',
  ARBITRE: 'arbitre',
} as const;
