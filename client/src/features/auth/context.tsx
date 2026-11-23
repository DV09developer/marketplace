'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from './api';
import { RegisterCredentials, LoginCredentials } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phoneNumber?: string; profileImage?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        // Try refreshing if access token expired
        const refreshRes = await authApi.refresh();
        if (refreshRes.success && refreshRes.data?.user) {
          setUser(refreshRes.data.user);
        } else {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(credentials);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: {
    fullName?: string;
    phoneNumber?: string;
    profileImage?: string;
  }) => {
    try {
      const res = await authApi.updateProfile(data);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to update profile' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
