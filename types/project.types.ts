import type { OrganizationRef } from './organization.types';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  organization: OrganizationRef;  // UPDATED - now an object with id and name
  createdBy: string;
  teamMembers: TeamMember[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  ticketCount?: {
    total: number;
    pending: number;
    assigned: number;
    closed: number;
  };
}

export interface TeamMember {
  userId: string;
  userName: string;
  role: 'project-manager' | 'qa' | 'developer';
  assignedAt?: string;
}
