/**
 * Application-wide constants
 * Centralized configuration values to avoid magic numbers and strings
 */

// API Configuration
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 100,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

// UI Configuration
export const UI_CONSTANTS = {
  MODAL_CLOSE_DELAY: 300, // milliseconds
  INITIAL_VISIBLE_TICKETS: 10,
  TICKETS_LOAD_MORE_INCREMENT: 10,
  DEBOUNCE_DELAY: 300, // milliseconds
  TOAST_DURATION: 3000, // milliseconds
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TICKETS: '/tickets',
  TICKETS_CREATE: '/tickets/create',
  PROJECTS: '/projects',
  SPRINTS: '/sprints',
  LABELS: '/labels',
  USERS: '/users',
  ORGANIZATIONS: '/organizations',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'user',
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 2,
  MAX_BIO_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 5000,
} as const;
