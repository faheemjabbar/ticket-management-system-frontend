// Label Category Enum
export enum LabelCategory {
  GENERAL = 'general',
  PRIORITY = 'priority',
  TYPE = 'type',
  PLATFORM = 'platform',
  TEAM = 'team'
}

// Label Category Display Labels
export const LABEL_CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  priority: 'Priority',
  type: 'Type',
  platform: 'Platform',
  team: 'Team',
};

// Recommended Label Colors
export const LABEL_COLORS = {
  red: '#EF4444',
  orange: '#F59E0B',
  amber: '#F59E0B',
  yellow: '#EAB308',
  lime: '#84CC16',
  green: '#10B981',
  emerald: '#10B981',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  sky: '#0EA5E9',
  blue: '#3B82F6',
  indigo: '#6366F1',
  violet: '#8B5CF6',
  purple: '#A855F7',
  fuchsia: '#D946EF',
  pink: '#EC4899',
  rose: '#F43F5E',
  gray: '#6B7280',
};

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  projectId: string;
  projectName?: string;
  category: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabelDto {
  name: string;
  color: string;
  description?: string;
  projectId: string;
  category: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
  description?: string;
  category?: string;
}
