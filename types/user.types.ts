export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  QA = 'qa',
  SUPERADMIN = 'superadmin'
}

export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'qa' | 'superadmin';
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