/**
 * Auth utility functions
 * Helper functions for authentication-related operations
 */

/**
 * Auth utility functions
 * Helper functions for authentication-related operations
 */

/**
 * Guard for browser-only storage access
 */
const isBrowser = typeof window !== 'undefined';

const getStorage = (useSessionStorage = false): Storage | null => {
  if (!isBrowser) return null;
  return useSessionStorage ? window.sessionStorage : window.localStorage;
};

const getAuthStorage = (): Storage | null => {
  if (!isBrowser) return null;
  if (window.localStorage.getItem('token') || window.localStorage.getItem('user')) return window.localStorage;
  if (window.sessionStorage.getItem('token') || window.sessionStorage.getItem('user')) return window.sessionStorage;
  return null;
};

/**
 * Get token from storage
 */
export const getToken = (): string | null => {
  if (!isBrowser) return null;
  return window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
};

/**
 * Get user from storage
 */
export const getStoredUser = () => {
  if (!isBrowser) return null;
  const userStr = window.localStorage.getItem('user') || window.sessionStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Clear all auth data from storage
 */
export const clearAuthData = (): void => {
  if (!isBrowser) return;
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  window.sessionStorage.removeItem('token');
  window.sessionStorage.removeItem('user');
};

/**
 * Store auth data in storage
 */
export const storeAuthData = (token: string, user: any, useSessionStorage = false): void => {
  if (!isBrowser) return;

  const storage = getStorage(useSessionStorage);
  if (!storage) return;

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
};

export const updateStoredUser = (user: any): void => {
  const storage = getAuthStorage();
  if (!storage) return;
  storage.setItem('user', JSON.stringify(user));
};

/**
 * Decode JWT token (without verification)
 * Note: This is for reading token data only, not for security validation
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
};

/**
 * Format role for display
 */
export const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

/**
 * Check if user has specific role
 */
export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

/**
 * Get role color for badges
 */
export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',  // System admin
    'project-manager': 'bg-purple-100 text-purple-700',  // Project manager
    developer: 'bg-blue-100 text-blue-700',
    qa: 'bg-green-100 text-green-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};
