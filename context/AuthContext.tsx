'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance, { setLoggingOut } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { User } from '@/types/user.types';
import { clearAuthData, getStoredUser, getToken, isTokenExpired, storeAuthData, updateStoredUser } from '@/lib/auth-utils';

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initAuth = () => {
      setLoading(true);

      try {
        const storedUser = getStoredUser();
        const token = getToken();

        if (token && storedUser && !isTokenExpired(token)) {
          setUser(storedUser);
        } else {
          clearAuthData();
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        clearAuthData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe = true) => {
    try {
      const res = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token: token, user } = res.data;

      if (user.role !== 'admin' && user.organization && !user.organization.isActive) {
        toast.error('Your organization has been deactivated. Please contact support.');
        return;
      }

      storeAuthData(token, user, !rememberMe);
      setUser(user);

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setLoggingOut(true);
    clearAuthData();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  // Update user function
  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;

    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    updateStoredUser(newUser);
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
