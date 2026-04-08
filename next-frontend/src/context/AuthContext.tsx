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
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  language?: string;
  phone?: string;
  avatarUrl?: string;
  headline?: string;
  expertise?: string[];
  qualifications?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  educationLevel?: string;
  interests?: string[];
  learningGoals?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  manuallyVerify: (tokens: { accessToken: string; refreshToken: string; user: User }) => void;
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
          // api.ts interceptor now unwraps this into the data field of the response
          const response: any = await api.get('/users/me');
          const userData = response.data;
          
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
      const response: any = await api.post('/auth/login', data);
      
      // Check if verification is needed (API returns status 200 but might have custom error response or success: false if handled)
      // Actually my backend returns success: false with statusCode 403.
      // Axios usually throws on 403. 
      // But let's check the unwrapped response data.
      if (response.data?.isVerified === false) {
        return response.data; // Return to allow page to handle verification
      }

      const { accessToken, refreshToken, user: userData } = response.data;
      
      setCookie('access_token', accessToken);
      setCookie('refresh_token', refreshToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      if (!userData.name && userData.email) {
        userData.name = userData.email.split('@')[0];
      }
      
      setUser(userData);
      toast.success('Successfully logged in!');
      router.push('/');
      return response.data;
    } catch (error: any) {
      // Special handle for 403 Account Unverified
      if (error.response?.data?.statusCode === 403) {
        return error.response.data;
      }
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setIsLoading(true);
      const response: any = await api.post('/auth/register', data);
      
      if (response.data?.isVerified === false) {
        toast.success('Registration successful! Please verify your email.');
        return response.data;
      }

      const { accessToken, refreshToken, user: userData } = response.data;
      
      setCookie('access_token', accessToken);
      setCookie('refresh_token', refreshToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      if (!userData.name && userData.email) {
        userData.name = userData.email.split('@')[0];
      }
      
      setUser(userData);
      toast.success('Registration successful!');
      router.push('/');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const manuallyVerify = (data: { accessToken: string; refreshToken: string; user: any }) => {
    const { accessToken, refreshToken, user: userData } = data;
    setCookie('access_token', accessToken);
    setCookie('refresh_token', refreshToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(userData);
    router.push('/');
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser, manuallyVerify }}>
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
