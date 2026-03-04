import axiosInstance from './axios';
import type { User } from '@/types/user.types';
import type { Project } from '@/types/project.types';
import type { Organization } from '@/types/organization.types';
import type { Ticket as TicketType, CreateTicketDto, LinkTicketDto, RelatedTicket, WatcherUser } from '@/types/ticket.types';
import type { Sprint, CreateSprintDto, UpdateSprintDto, SprintStats } from '@/types/sprint.types';
import type { Label, CreateLabelDto, UpdateLabelDto } from '@/types/label.types';

// Re-export Ticket type from types directory
export type Ticket = TicketType;

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  attachments: any[];
  createdAt: string;
  updatedAt: string;
  // Phase 3: Enhanced comments
  type?: 'comment' | 'internal_note' | 'system';
  isInternal?: boolean;
  mentions?: string[];
  parentCommentId?: string;
  isEdited?: boolean;
  editedAt?: string;
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  ticketAssigned: boolean;
  ticketUpdated: boolean;
  ticketClosed: boolean;
  weeklyDigest: boolean;
  mentionNotifications: boolean;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Re-export domain types for convenience
export type { User, Project, Organization, Sprint, Label };

// API Response types
interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User API functions
export const userAPI = {
  // Get all users (Project Manager only)
  getAll: async (params?: {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse & { users: User[] }> => {
    const response = await axiosInstance.get('/api/users', { params });
    return response.data;
  },

  // Create user (Project Manager/Admin only)
  create: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'project-manager' | 'developer' | 'qa';
    organizationId: string;  // Required - project manager's organization ID
    bio?: string;
  }): Promise<User> => {
    const response = await axiosInstance.post('/api/users', data);
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data;
  },

  // Update user
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Toggle user status (Project Manager only)
  toggleStatus: async (id: string): Promise<{ id: string; name: string; isActive: boolean }> => {
    const response = await axiosInstance.patch(`/api/users/${id}/toggle-status`);
    return response.data;
  },

  // Delete user (Project Manager only)
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/users/${id}`);
    return response.data;
  },

  // Change password
  changePassword: async (id: string, data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/api/users/${id}/password`, data);
    return response.data;
  },

  // Get notification preferences
  getNotificationPreferences: async (id: string): Promise<NotificationPreferences> => {
    const response = await axiosInstance.get(`/api/users/${id}/notification-preferences`);
    return response.data;
  },

  // Update notification preferences
  updateNotificationPreferences: async (id: string, preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await axiosInstance.put(`/api/users/${id}/notification-preferences`, preferences);
    return response.data;
  },
};

// Project API functions
export const projectAPI = {
  // Get all projects
  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse & { projects: Project[] }> => {
    const response = await axiosInstance.get('/api/projects', { params });
    return response.data;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await axiosInstance.get(`/api/projects/${id}`);
    return response.data;
  },

  // Create project (Project Manager/QA only)
  create: async (data: {
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate?: string;
    teamMembers: { userId: string; role: string }[];
  }): Promise<Project> => {
    const response = await axiosInstance.post('/api/projects', data);
    return response.data;
  },

  // Update project (Project Manager/QA only)
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await axiosInstance.put(`/api/projects/${id}`, data);
    return response.data;
  },

  // Delete project (Project Manager only)
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/projects/${id}`);
    return response.data;
  },
};

// Ticket API functions
export const ticketAPI = {
  // Get all tickets
  getAll: async (params?: {
    status?: string;
    priority?: string;
    projectId?: string;
    assignedToId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse & { tickets: Ticket[] }> => {
    const response = await axiosInstance.get('/api/tickets', { params });
    return response.data;
  },

  // Get ticket by ID
  getById: async (id: string): Promise<Ticket> => {
    const response = await axiosInstance.get(`/api/tickets/${id}`);
    return response.data;
  },

  // Create ticket (Project Manager/QA only)
  create: async (data: CreateTicketDto): Promise<Ticket> => {
    // Only send fields that backend expects
    const ticketData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      projectId: data.projectId,
      labels: data.labels || [],
      assignedToId: data.assignedToId,
      deadline: data.deadline,
      storyPoints: data.storyPoints,
      estimatedHours: data.estimatedHours,
      sprintId: data.sprintId,
      parentId: data.parentId,
    };
    const response = await axiosInstance.post('/api/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  update: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await axiosInstance.put(`/api/tickets/${id}`, data);
    return response.data;
  },

  // Assign ticket (Phase 1: No longer changes status automatically)
  assign: async (id: string, data: {
    assignedToId: string;
    assignedToName: string;
  }): Promise<{ id: string; title: string; assignedToId: string; assignedToName: string }> => {
    const response = await axiosInstance.patch(`/api/tickets/${id}/assign`, data);
    return response.data;
  },

  // Update ticket status (Phase 1: Separate from assignment)
  updateStatus: async (id: string, status: string): Promise<{ id: string; title: string; status: string }> => {
    const response = await axiosInstance.patch(`/api/tickets/${id}/status`, { status });
    return response.data;
  },

  // Delete ticket
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/tickets/${id}`);
    return response.data;
  },

  // Phase 2: Link tickets
  linkTicket: async (id: string, data: LinkTicketDto): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/api/tickets/${id}/link`, data);
    return response.data;
  },

  // Phase 2: Unlink tickets
  unlinkTicket: async (id: string, targetId: string, relationType: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/tickets/${id}/link/${targetId}/${relationType}`);
    return response.data;
  },

  // Phase 2: Get related tickets
  getRelatedTickets: async (id: string): Promise<RelatedTicket[]> => {
    const response = await axiosInstance.get(`/api/tickets/${id}/related`);
    return response.data;
  },

  // Phase 3: Watchers
  addWatcher: async (id: string, userId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/api/tickets/${id}/watchers`, { userId });
    return response.data;
  },

  removeWatcher: async (id: string, userId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/tickets/${id}/watchers/${userId}`);
    return response.data;
  },

  getWatchers: async (id: string): Promise<{ watchers: WatcherUser[]; count: number }> => {
    const response = await axiosInstance.get(`/api/tickets/${id}/watchers`);
    return response.data;
  },
};

// Comment API functions
export const commentAPI = {
  // Get comments for ticket
  getByTicketId: async (ticketId: string): Promise<Comment[]> => {
    const response = await axiosInstance.get(`/api/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Add comment to ticket
  create: async (ticketId: string, data: {
    content: string;
    attachments?: any[];
    type?: 'comment' | 'internal_note' | 'system';
    isInternal?: boolean;
    mentions?: string[];
    parentCommentId?: string;
  }): Promise<Comment> => {
    const response = await axiosInstance.post(`/api/tickets/${ticketId}/comments`, data);
    return response.data;
  },

  // Update comment
  update: async (id: string, data: { content: string }): Promise<Comment> => {
    const response = await axiosInstance.put(`/api/comments/${id}`, data);
    return response.data;
  },

  // Delete comment
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/comments/${id}`);
    return response.data;
  },
};

// History API functions
export const historyAPI = {
  // Get ticket history
  getByTicketId: async (ticketId: string): Promise<HistoryEntry[]> => {
    const response = await axiosInstance.get(`/api/tickets/${ticketId}/history`);
    return response.data;
  },
};

// Auth API functions (already implemented in AuthContext, but adding for completeness)
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  // Register Admin (public endpoint - no auth required)
  registerAdmin: async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await axiosInstance.post('/auth/register-admin', data);
    return response.data;
  },

  // Check if admin exists (public endpoint)
  checkAdminExists: async (): Promise<{ exists: boolean }> => {
    const response = await axiosInstance.get('/auth/admin-exists');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};

// File Upload API functions
export const uploadAPI = {
  // Upload file
  upload: async (file: File, onProgress?: (progress: number) => void): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // Download file
  download: async (fileId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/api/upload/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete file
  delete: async (fileId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/upload/${fileId}`);
    return response.data;
  },
};

// Organization API functions (Admin only)
export const organizationAPI = {
  // Get all organizations
  getAll: async (): Promise<Organization[]> => {
    const response = await axiosInstance.get('/api/organizations');
    return response.data;
  },

  // Get organization by ID
  getById: async (id: string): Promise<Organization> => {
    const response = await axiosInstance.get(`/api/organizations/${id}`);
    return response.data;
  },

  // Create organization with project manager (atomic transaction)
  createWithAdmin: async (data: {
    name: string;
    description?: string;
    projectManager: {
      name: string;
      email: string;
      password: string;
    };
  }): Promise<any> => {
    const response = await axiosInstance.post('/api/organizations/with-admin', data);
    return response.data;
  },

  // Update organization
  update: async (id: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Organization> => {
    const response = await axiosInstance.put(`/api/organizations/${id}`, data);
    return response.data;
  },

  // Delete organization
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/organizations/${id}`);
    return response.data;
  },
};

// Label API functions (Phase 3)
export const labelAPI = {
  // Get all labels
  getAll: async (params?: {
    projectId?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse & { labels: Label[] }> => {
    const response = await axiosInstance.get('/api/labels', { params });
    return response.data;
  },

  // Get label by ID
  getById: async (id: string): Promise<Label> => {
    const response = await axiosInstance.get(`/api/labels/${id}`);
    return response.data;
  },

  // Create label (Project Manager only)
  create: async (data: CreateLabelDto): Promise<Label> => {
    const response = await axiosInstance.post('/api/labels', data);
    return response.data;
  },

  // Update label (Project Manager only)
  update: async (id: string, data: UpdateLabelDto): Promise<Label> => {
    const response = await axiosInstance.put(`/api/labels/${id}`, data);
    return response.data;
  },

  // Delete label (Project Manager only)
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/labels/${id}`);
    return response.data;
  },
};

// Sprint API functions (Phase 2)
export const sprintAPI = {
  // Get all sprints
  getAll: async (params?: {
    projectId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse & { sprints: Sprint[] }> => {
    const response = await axiosInstance.get('/api/sprints', { params });
    return response.data;
  },

  // Get sprint by ID
  getById: async (id: string): Promise<Sprint> => {
    const response = await axiosInstance.get(`/api/sprints/${id}`);
    return response.data;
  },

  // Get sprint statistics
  getStats: async (id: string): Promise<SprintStats> => {
    const response = await axiosInstance.get(`/api/sprints/${id}/stats`);
    return response.data;
  },

  // Create sprint (Project Manager only)
  create: async (data: CreateSprintDto): Promise<Sprint> => {
    const response = await axiosInstance.post('/api/sprints', data);
    return response.data;
  },

  // Update sprint (Project Manager only)
  update: async (id: string, data: UpdateSprintDto): Promise<Sprint> => {
    const response = await axiosInstance.put(`/api/sprints/${id}`, data);
    return response.data;
  },

  // Delete sprint (Project Manager only)
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/sprints/${id}`);
    return response.data;
  },
};