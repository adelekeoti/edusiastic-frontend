// src/lib/api/teachers.ts - Teacher API Functions

import apiClient from './client';
import { ApiResponse, PaginatedResponse, User, PaginationMeta } from '@/types';

// ==================== TEACHER FILTERS ====================

export interface TeacherFilters {
  categoryId?: string;
  subcategoryId?: string;
  minRating?: number;
  search?: string;
  isAvailableForHomeTutoring?: boolean;
  location?: string;
  minExperience?: number;
  sortBy?: 'rating' | 'experience' | 'students' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ==================== TEACHER CRUD ====================

/**
 * Get all teachers (public directory)
 */
export const getAllTeachers = async (filters?: TeacherFilters): Promise<ApiResponse<{ teachers: User[]; pagination: PaginationMeta }>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  const queryString = params.toString();
  return apiClient.get(`/teachers${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get single teacher profile by ID
 */
export const getTeacherById = async (id: string): Promise<ApiResponse<{ teacher: User }>> => {
  return apiClient.get(`/teachers/${id}`);
};

/**
 * Get teacher's public profile (includes products, ratings, etc.)
 */
export const getTeacherProfile = async (id: string): Promise<ApiResponse<{
  teacher: User;
  products?: any[];
  ratings?: any[];
  stats?: {
    totalProducts: number;
    totalStudents: number;
    averageRating: number;
    totalRatings: number;
  };
}>> => {
  return apiClient.get(`/teachers/${id}/profile`);
};

/**
 * Search teachers by name or expertise
 */
export const searchTeachers = async (query: string, filters?: Partial<TeacherFilters>): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({ search: query });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  return apiClient.get(`/teachers/search?${params}`);
};

/**
 * Get featured/top-rated teachers
 */
export const getFeaturedTeachers = async (limit = 10): Promise<ApiResponse<{ teachers: User[] }>> => {
  return apiClient.get(`/teachers/featured?limit=${limit}`);
};

/**
 * Get teachers by category
 */
export const getTeachersByCategory = async (categoryId: string, filters?: Partial<TeacherFilters>): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({ categoryId });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  return apiClient.get(`/teachers?${params}`);
};

/**
 * Get teachers by subcategory
 */
export const getTeachersBySubcategory = async (subcategoryId: string, filters?: Partial<TeacherFilters>): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({ subcategoryId });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  return apiClient.get(`/teachers?${params}`);
};