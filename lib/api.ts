import axiosInstance from './axios';

// Types based on API specification
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'qa' | 'superadmin';
  avatar?: string;
  isActive: boolean;
  bio?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Activity {
  id: string;
  type: string;
  ticketId: string;
  ticketTitle: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  targetUserId?: string;
  targetUserName?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  createdBy: string;
  teamMembers: {
    userId: string;
    userName: string;
    role: 'admin' | 'qa' | 'developer' | 'superadmin';
    assignedAt: string;
  }[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'awaiting' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  projectName: string;
  authorId: string;
  authorName: string;
  assignedToId?: string;
  assignedToName?: string;
  labels: string[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  attachments: any[];
  createdAt: string;
  updatedAt: string;
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

// API Response types
interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User API functions
export const userAPI = {
  // Get all users (Admin only)
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

  // Toggle user status (Admin only)
  toggleStatus: async (id: string): Promise<{ id: string; name: string; isActive: boolean }> => {
    const response = await axiosInstance.patch(`/api/users/${id}/toggle-status`);
    return response.data;
  },

  // Delete user (Admin only)
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

  // Create project (Admin/QA only)
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

  // Update project (Admin/QA only)
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await axiosInstance.put(`/api/projects/${id}`, data);
    return response.data;
  },

  // Delete project (Admin only)
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

  // Create ticket (Admin/QA only)
  create: async (data: {
    title: string;
    description: string;
    priority: string;
    projectId: string;
    labels?: string[];
    deadline?: string;
  }): Promise<Ticket> => {
    const response = await axiosInstance.post('/api/tickets', data);
    return response.data;
  },

  // Update ticket
  update: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await axiosInstance.put(`/api/tickets/${id}`, data);
    return response.data;
  },

  // Assign ticket
  assign: async (id: string, data: {
    assignedToId: string;
    assignedToName: string;
  }): Promise<{ id: string; title: string; status: string; assignedToId: string; assignedToName: string }> => {
    const response = await axiosInstance.patch(`/api/tickets/${id}/assign`, data);
    return response.data;
  },

  // Update ticket status
  updateStatus: async (id: string, status: string): Promise<{ id: string; title: string; status: string }> => {
    const response = await axiosInstance.patch(`/api/tickets/${id}/status`, { status });
    return response.data;
  },

  // Delete ticket
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/api/tickets/${id}`);
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

// Activities API functions
export const activitiesAPI = {
  // Get recent activities
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    userId?: string;
  }): Promise<{
    activities: Activity[];
    total: number;
    hasMore: boolean;
  }> => {
    const response = await axiosInstance.get('/api/activities', { params });
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

  // Register
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await axiosInstance.post('/auth/register', data);
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