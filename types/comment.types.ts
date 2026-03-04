import { User } from './user.types';

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  // Phase 3: Enhanced comments
  type?: 'comment' | 'internal_note' | 'system';
  isInternal?: boolean;
  mentions?: string[];
  parentCommentId?: string;
  isEdited?: boolean;
  editedAt?: string;
}

export const COMMENT_TYPE_ICONS = {
  comment: '💬',
  internal_note: '🔒',
  system: '⚙️',
};