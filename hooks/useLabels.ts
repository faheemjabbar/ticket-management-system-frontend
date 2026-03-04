import { useState, useEffect, useCallback, useRef } from 'react';
import { labelAPI } from '@/lib/api';
import type { Label, CreateLabelDto, UpdateLabelDto } from '@/types/label.types';
import { cache, CACHE_KEYS } from '@/lib/cache';

export function useLabels(projectId?: string) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchLabels = useCallback(async (forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<Label[]>(CACHE_KEYS.LABELS, 60000); // 60s TTL
      if (cached) {
        const filtered = projectId 
          ? cached.filter(l => l.projectId === projectId)
          : cached;
        setLabels(filtered);
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
      const params = projectId ? { projectId, limit: 100 } : { limit: 100 };
      const response = await labelAPI.getAll(params);
      
      // Update cache
      cache.set(CACHE_KEYS.LABELS, response.labels || []);
      
      setLabels(response.labels || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch labels');
      console.error('Error fetching labels:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [projectId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const createLabel = async (data: CreateLabelDto) => {
    try {
      const newLabel = await labelAPI.create(data);
      setLabels(prev => [newLabel, ...prev]);
      cache.invalidate(CACHE_KEYS.LABELS);
      return newLabel;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create label');
    }
  };

  const updateLabel = async (id: string, data: UpdateLabelDto) => {
    try {
      const updatedLabel = await labelAPI.update(id, data);
      setLabels(prev => prev.map(l => l.id === id ? updatedLabel : l));
      cache.invalidate(CACHE_KEYS.LABELS);
      return updatedLabel;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update label');
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      await labelAPI.delete(id);
      setLabels(prev => prev.filter(l => l.id !== id));
      cache.invalidate(CACHE_KEYS.LABELS);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete label');
    }
  };

  return {
    labels,
    loading,
    error,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  };
}
