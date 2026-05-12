import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { clearAuthData, getToken } from '@/lib/auth-utils';

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
    const token = getToken();

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
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const isBrowser = typeof window !== 'undefined';

      switch (status) {
        case 401: {
          const isAuthPage = isBrowser &&
            (window.location.pathname.includes('/login') ||
             window.location.pathname.includes('/register'));

          if (isAuthPage) {
            toast.error(data?.message || 'Invalid credentials');
          } else {
            toast.error('Session expired. Please login again.');
            clearAuthData();
            if (isBrowser) {
              window.location.href = '/login';
            }
          }
          break;
        }

        case 403: {
          const errorMessage = data?.message || '';

          if (errorMessage.toLowerCase().includes('organization') &&
              errorMessage.toLowerCase().includes('deactivated')) {
            toast.error('Your organization has been deactivated. Please contact support.');
            clearAuthData();
            if (isBrowser) {
              window.location.href = '/login';
            }
          } else {
            toast.error(data?.message || 'You do not have permission to perform this action');
          }
          break;
        }

        case 404: {
          if (process.env.NODE_ENV === 'development' && error.config?.url) {
            console.error('API 404 Error:', {
              url: error.config.url,
              baseURL: error.config.baseURL,
              fullURL: `${error.config.baseURL}${error.config.url}`,
            });
          }
          toast.error(data?.message || 'Resource not found');
          break;
        }

        case 422:
          toast.error(data?.message || 'Validation error');
          break;

        case 500:
        case 502:
        case 503:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Cannot connect to server. Please check if backend is running.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
