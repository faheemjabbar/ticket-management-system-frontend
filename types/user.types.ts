export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  QA = 'qa',
  SUPERADMIN = 'superadmin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'qa' | 'superadmin';
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