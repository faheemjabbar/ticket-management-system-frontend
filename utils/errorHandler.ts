import { toast } from 'react-hot-toast';

/**
 * Centralized error handling utility
 * Prevents duplicate error toasts and standardizes error messages
 */
export function handleApiError(error: any, customHandler?: (error: any) => void) {
  // If custom handler provided, use it
  if (customHandler) {
    customHandler(error);
    return;
  }

  // Don't show toast for 401 errors - axios interceptor handles them
  if (error.response?.status === 401) {
    return;
  }

  // Don't show toast for 403 errors - axios interceptor handles them
  if (error.response?.status === 403) {
    return;
  }

  // For other errors, only show if axios interceptor didn't handle it
  // (This prevents duplicate toasts)
  console.error('API Error:', error);
}

/**
 * Handle form validation errors
 */
export function handleValidationError(error: any) {
  if (error.response?.status === 400) {
    const message = error.response.data.message;
    if (Array.isArray(message)) {
      toast.error(message.join(', '));
    } else {
      toast.error(message || 'Validation failed');
    }
  }
}
