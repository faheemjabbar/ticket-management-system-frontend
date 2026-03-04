import { useState, useCallback, useRef } from 'react';
import { userAPI, type User } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';
import { cache, CACHE_KEYS } from '@/lib/cache';

/**
 * Custom hook for user data management with centralized caching
 * Prevents duplicate API calls and improves performance
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const fetchUsers = useCallback(async (options?: { limit?: number }, forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<User[]>(CACHE_KEYS.USERS, 60000); // 60s TTL
      if (cached) {
        const filteredUsers = cached.filter(user => user.role !== 'admin');
        setUsers(filteredUsers);
        return filteredUsers;
      }
    }

    // Prevent duplicate simultaneous requests
    if (fetchingRef.current) {
      return users;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await userAPI.getAll(options || { limit: 100 });
      
      // Update cache
      cache.set(CACHE_KEYS.USERS, response.users);
      
      // Filter out admin users from the list
      const filteredUsers = response.users.filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
      return filteredUsers;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [users]);

  const createUser = useCallback(async (userData: any) => {
    try {
      const newUser = await userAPI.create(userData);
      setUsers(prev => [...prev, newUser]);
      cache.invalidate(CACHE_KEYS.USERS);
      return newUser;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, userData: any) => {
    try {
      const updatedUser = await userAPI.update(userId, userData);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      cache.invalidate(CACHE_KEYS.USERS);
      return updatedUser;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await userAPI.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      cache.invalidate(CACHE_KEYS.USERS);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      await userAPI.toggleStatus(userId);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ));
      cache.invalidate(CACHE_KEYS.USERS);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
}
