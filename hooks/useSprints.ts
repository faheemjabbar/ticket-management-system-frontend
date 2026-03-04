import { useState, useEffect, useCallback, useRef } from 'react';
import { sprintAPI } from '@/lib/api';
import type { Sprint, CreateSprintDto, UpdateSprintDto, SprintStats } from '@/types/sprint.types';
import { cache, CACHE_KEYS } from '@/lib/cache';

export function useSprints(projectId?: string) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchSprints = useCallback(async (forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<Sprint[]>(CACHE_KEYS.SPRINTS, 60000); // 60s TTL
      if (cached) {
        const filtered = projectId 
          ? cached.filter(s => s.projectId === projectId)
          : cached;
        setSprints(filtered);
        setLoading(false);
        return;
      }
    }

    // Prevent duplicate simultaneous requests
    if (fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      const params = projectId ? { projectId } : {};
      const response = await sprintAPI.getAll(params);
      
      // Update cache
      cache.set(CACHE_KEYS.SPRINTS, response.sprints || []);
      
      setSprints(response.sprints || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sprints');
      console.error('Error fetching sprints:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [projectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const createSprint = async (data: CreateSprintDto) => {
    try {
      const newSprint = await sprintAPI.create(data);
      setSprints(prev => [newSprint, ...prev]);
      cache.invalidate(CACHE_KEYS.SPRINTS);
      return newSprint;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create sprint');
    }
  };

  const updateSprint = async (id: string, data: UpdateSprintDto) => {
    try {
      const updatedSprint = await sprintAPI.update(id, data);
      setSprints(prev => prev.map(s => s.id === id ? updatedSprint : s));
      cache.invalidate(CACHE_KEYS.SPRINTS);
      return updatedSprint;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update sprint');
    }
  };

  const deleteSprint = async (id: string) => {
    try {
      await sprintAPI.delete(id);
      setSprints(prev => prev.filter(s => s.id !== id));
      cache.invalidate(CACHE_KEYS.SPRINTS);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete sprint');
    }
  };

  const getSprintStats = async (id: string): Promise<SprintStats> => {
    try {
      return await sprintAPI.getStats(id);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch sprint stats');
    }
  };

  return {
    sprints,
    loading,
    error,
    fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint,
    getSprintStats,
  };
}
