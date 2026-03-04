// Sprint Status Enum
export enum SprintStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

// Sprint Status Display Labels
export const SPRINT_STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
};

// Sprint Status Colors
export const SPRINT_STATUS_COLORS: Record<string, string> = {
  planning: '#6B7280',
  active: '#3B82F6',
  completed: '#10B981',
};

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  capacity: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintDto {
  name: string;
  goal: string;
  projectId: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export interface UpdateSprintDto {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status?: 'planning' | 'active' | 'completed';
  capacity?: number;
}

export interface SprintStats {
  totalTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  todoTickets: number;
  blockedTickets: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  capacity: number;
  progress: number;
}
