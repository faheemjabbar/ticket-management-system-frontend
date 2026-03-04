import { useState, useCallback, useRef } from 'react';
import { projectAPI, type Project } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';
import { cache, CACHE_KEYS } from '@/lib/cache';

/**
 * Custom hook for project data management with centralized caching
 * Prevents duplicate API calls and improves performance
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const fetchProjects = useCallback(async (options?: { limit?: number }, forceRefresh = false) => {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<Project[]>(CACHE_KEYS.PROJECTS, 60000); // 60s TTL
      if (cached) {
        setProjects(cached);
        return cached;
      }
    }

    // Prevent duplicate simultaneous requests
    if (fetchingRef.current) {
      return projects;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await projectAPI.getAll(options || { limit: 100 });
      
      // Update cache
      cache.set(CACHE_KEYS.PROJECTS, response.projects);
      
      setProjects(response.projects);
      return response.projects;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [projects]);

  const fetchProjectById = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      const project = await projectAPI.getById(projectId);
      return project;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData: any) => {
    try {
      const newProject = await projectAPI.create(projectData);
      setProjects(prev => [...prev, newProject]);
      cache.invalidate(CACHE_KEYS.PROJECTS);
      return newProject;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, projectData: any) => {
    try {
      const updatedProject = await projectAPI.update(projectId, projectData);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      cache.invalidate(CACHE_KEYS.PROJECTS);
      return updatedProject;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await projectAPI.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      cache.invalidate(CACHE_KEYS.PROJECTS);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, []);

  return {
    projects,
    loading,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
  };
}
