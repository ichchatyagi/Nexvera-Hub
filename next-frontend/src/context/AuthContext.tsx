"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getCookie('access_token') || localStorage.getItem('access_token');
      if (accessToken) {
        try {
          // api.ts interceptor now unwraps this to return the user directly
          const userData: any = await api.get('/users/me');
          
          // Fallback for missing name field
          if (!userData.name && userData.email) {
            userData.name = userData.email.split('@')[0];
          }
          
          setUser(userData);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    try {
      setIsLoading(true);
      // api.ts interceptor unwraps {success, data}
      const authData: any = await api.post('/auth/login', data);
      const { accessToken, refreshToken, user: userData } = authData;
      
      setCookie('access_token', accessToken);
      setCookie('refresh_token', refreshToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Fallback for missing name field
      if (!userData.name && userData.email) {
        userData.name = userData.email.split('@')[0];
      }
      
      setUser(userData);
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setIsLoading(true);
      // api.ts interceptor unwraps {success, data}
      const authData: any = await api.post('/auth/register', data);
      const { accessToken, refreshToken, user: userData } = authData;
      
      setCookie('access_token', accessToken);
      setCookie('refresh_token', refreshToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Fallback for missing name field
      if (!userData.name && userData.email) {
        userData.name = userData.email.split('@')[0];
      }
      
      setUser(userData);
      toast.success('Registration successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
    toast.success('Logged out');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
