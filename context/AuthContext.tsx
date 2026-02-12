'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance, { setLoggingOut } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { User } from '@/types/user.types';

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const res = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token: token, user } = res.data;

      // Store token and user in localStorage (now includes organizationId)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);

      // Show success message
      toast.success('Login successful!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      // Error already handled by axios interceptor
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      // Show success message
      toast.success('Account created successfully!');

      // Redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error: any) {
      // Error already handled by axios interceptor
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Set flag to prevent error toasts
    setLoggingOut(true);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear state
    setUser(null);

    // Show message
    toast.success('Logged out successfully');

    // Redirect to login
    router.push('/login');
    
    // Reset flag after navigation
    setTimeout(() => {
      setLoggingOut(false);
    }, 500);
  };

  // Update user function
  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;
    
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
