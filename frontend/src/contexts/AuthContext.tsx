'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default user with admin role for unrestricted access
const defaultUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@frauddetection.com',
  role: 'ADMIN',
  full_name: 'System Administrator',
  is_active: true,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always authenticated - no authentication required
  const value: AuthContextType = {
    user: defaultUser,
    token: null,
    isAuthenticated: true,
    login: async () => {
      // No-op
    },
    logout: () => {
      // No-op
    },
    hasRole: () => {
      // Always return true - no role restrictions
      return true;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(requiredRoles?: string[]) {
  // No-op - authentication is not required
  const { user, hasRole } = useAuth();
  return { isAuthenticated: true, user, hasRole };
}

