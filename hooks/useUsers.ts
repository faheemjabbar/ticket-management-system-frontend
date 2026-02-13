import { useState, useCallback } from 'react';
import { userAPI, type User } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';

/**
 * Custom hook for user data management
 * Centralizes all user-related API calls
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (options?: { limit?: number }) => {
    try {
      setLoading(true);
      const response = await userAPI.getAll(options || { limit: 100 });
      // Filter out admin users from the list
      const filteredUsers = response.users.filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
      return filteredUsers;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: any) => {
    try {
      const newUser = await userAPI.create(userData);
      setUsers(prev => [...prev, newUser]);
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
