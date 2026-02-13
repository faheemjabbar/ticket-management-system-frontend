export enum UserRole {
  ADMIN = 'admin',  // System administrator
  PROJECT_MANAGER = 'project-manager',  // Project manager (with hyphen to match backend)
  DEVELOPER = 'developer',
  QA = 'qa'
}

export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project-manager' | 'developer' | 'qa';
  organization?: Organization | null;  // UPDATED - now an object with id and name
  createdBy?: string;
  avatar?: string;
  projects?: string[];
  isActive: boolean;
  bio?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}