import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// Flag to track if user is logging out
let isLoggingOut = false;

// Export function to set logout state
export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Attach token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Don't show error toasts if user is logging out
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    // Handle different error status codes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Check if user is on login/register page
          const isAuthPage = typeof window !== 'undefined' && 
            (window.location.pathname.includes('/login') || 
             window.location.pathname.includes('/register'));
          
          if (isAuthPage) {
            // On auth pages, show the actual error message from backend
            toast.error(data?.message || 'Invalid credentials');
          } else {
            // On protected pages, it's a session expiry
            toast.error('Session expired. Please login again.');
            
            // Clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - check if it's organization deactivation
          const errorMessage = data?.message || '';
          
          if (errorMessage.toLowerCase().includes('organization') && 
              errorMessage.toLowerCase().includes('deactivated')) {
            // Organization deactivated - clear session and redirect
            toast.error('Your organization has been deactivated. Please contact support.');
            window.location.href = '/login';
          } else {
            // Other permission errors
            toast.error(data?.message || 'You do not have permission to perform this action');
          }
          break;
          
        case 404:
          // Not found
          toast.error(data?.message || 'Resource not found');
          break;
          
        case 422:
          // Validation error
          toast.error(data?.message || 'Validation error');
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // Other errors - show backend message if available
          toast.error(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('Cannot connect to server. Please check if backend is running.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
