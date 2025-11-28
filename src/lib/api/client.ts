// src/lib/api/client.ts - Axios API Client

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject({
        success: false,
        message: 'Network error',
        errors: ['Unable to connect to the server']
      });
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(data.message || 'Invalid request');
        }
        break;

      case 401:
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again.');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        break;

      case 403:
        toast.error(data.message || 'You do not have permission to perform this action');
        break;

      case 404:
        toast.error(data.message || 'Resource not found');
        break;

      case 409:
        toast.error(data.message || 'Conflict error');
        break;

      case 429:
        toast.error(data.message || 'Too many requests. Please try again later.');
        break;

      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.');
        break;

      default:
        toast.error(data.message || 'An unexpected error occurred');
    }

    // FIX: Return a proper error object with message property
    // This ensures error.message is accessible in catch blocks
    return Promise.reject({
      ...data,
      message: data.message || 'An error occurred',
      statusCode: status
    });
  }
);

export default apiClient;