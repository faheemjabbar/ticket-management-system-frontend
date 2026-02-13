import { useState, useCallback } from 'react';
import { projectAPI, type Project } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';

/**
 * Custom hook for project data management
 * Centralizes all project-related API calls
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async (options?: { limit?: number }) => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll(options || { limit: 100 });
      setProjects(response.projects);
      return response.projects;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
