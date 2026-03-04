import type { Label } from './label.types';

// New Status Enum (Phase 1)
export enum TicketStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  QA_TESTING = 'qa_testing',
  DONE = 'done',
  CLOSED = 'closed',
  BLOCKED = 'blocked',
  REJECTED = 'rejected'
}

// New Type Enum (Phase 1)
export enum TicketType {
  BUG = 'bug',
  FEATURE = 'feature',
  TASK = 'task',
  IMPROVEMENT = 'improvement',
  EPIC = 'epic',
  STORY = 'story'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Status Display Labels
export const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  qa_testing: 'QA Testing',
  done: 'Done',
  closed: 'Closed',
  blocked: 'Blocked',
  rejected: 'Rejected',
};

// Status Colors
export const STATUS_COLORS: Record<string, string> = {
  backlog: '#6B7280',
  todo: '#3B82F6',
  in_progress: '#F59E0B',
  in_review: '#8B5CF6',
  qa_testing: '#EC4899',
  done: '#10B981',
  closed: '#059669',
  blocked: '#EF4444',
  rejected: '#6B7280',
};

// Type Display Labels
export const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  task: 'Task',
  improvement: 'Improvement',
  epic: 'Epic',
  story: 'Story',
};


// Type Colors
export const TYPE_COLORS: Record<string, string> = {
  bug: '#EF4444',
  feature: '#3B82F6',
  task: '#6B7280',
  improvement: '#8B5CF6',
  epic: '#F59E0B',
  story: '#10B981',
};

// Valid Status Transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  backlog: ['todo', 'rejected'],
  todo: ['in_progress', 'backlog'],
  in_progress: ['in_review', 'blocked', 'backlog'],
  in_review: ['qa_testing', 'in_progress'],
  qa_testing: ['done', 'in_progress'],
  blocked: ['in_progress', 'backlog'],
  done: ['closed', 'in_progress'],
  rejected: [],
  closed: ['in_progress'],
};

// Helper function to validate status transitions
export function canTransitionTo(currentStatus: string, newStatus: string): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

// Relationship Types (Phase 2)
export enum RelationType {
  BLOCKS = 'blocks',
  BLOCKED_BY = 'blocked_by',
  RELATES_TO = 'relates_to',
  DUPLICATES = 'duplicates',
  DUPLICATE_OF = 'duplicate_of'
}

export const RELATION_TYPE_LABELS: Record<string, string> = {
  blocks: 'Blocks',
  blocked_by: 'Blocked By',
  relates_to: 'Relates To',
  duplicates: 'Duplicates',
  duplicate_of: 'Duplicate Of',
};

export interface TicketRelationship {
  ticketId: string;
  relationType: string;
}

export interface RelatedTicket {
  id: string;
  title: string;
  status: string;
  type: string;
  relationType: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  
  // Status & Type (Phase 1)
  status: string;
  type: string;
  
  // Priority
  priority: 'low' | 'medium' | 'high' | 'critical';
  priorityScore: number; // NEW: 0-10000, default 1000
  
  // Project & Assignment
  projectId: string;
  projectName: string;
  authorId: string;
  authorName: string;
  assignedToId?: string;
  assignedToName?: string;
  
  // Estimation (Phase 1)
  storyPoints?: number;
  estimatedHours?: number;
  
  // Acceptance Criteria (Phase 1)
  acceptanceCriteria: string[];
  
  // Phase 2: Sprint & Relationships
  sprintId?: string;
  sprintName?: string;
  parentId?: string;
  parentTitle?: string;
  relatedTickets?: TicketRelationship[];
  
  // Phase 3: Labels and Watchers
  labelObjects?: Label[];  // Populated label objects
  watchers?: string[];  // Watcher user IDs
  watcherObjects?: WatcherUser[];  // Populated watcher objects
  
  // Metadata
  labels: string[];  // Label IDs (changed from string[] to ObjectId[] in backend)
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatcherUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  type?: string;
  status?: string;
  priority: string;
  priorityScore?: number;
  projectId: string;
  assignedToId?: string;
  deadline?: string;
  storyPoints?: number;
  estimatedHours?: number;
  acceptanceCriteria?: string[];
  labels?: string[];
  // Phase 2
  sprintId?: string;
  parentId?: string;
}

export interface LinkTicketDto {
  targetTicketId: string;
  relationType: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  user: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}