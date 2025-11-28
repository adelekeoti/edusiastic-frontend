// src/lib/api/categories.ts - Category API calls

import apiClient from './client';
import { ApiResponse, Category, Subcategory } from '@/types';

/**
 * Get all categories with subcategories
 */
export const getAllCategories = async (): Promise<ApiResponse<{ categories: Category[] }>> => {
  return apiClient.get('/categories');
};

/**
 * Get single category by ID
 */
export const getCategoryById = async (id: string): Promise<ApiResponse<{ category: Category }>> => {
  return apiClient.get(`/categories/${id}`);
};

/**
 * Get all subcategories (optionally filtered by category)
 */
export const getAllSubcategories = async (
  categoryId?: string
): Promise<ApiResponse<{ subcategories: Subcategory[] }>> => {
  const params = categoryId ? `?categoryId=${categoryId}` : '';
  return apiClient.get(`/categories/subcategories${params}`);
};

/**
 * Update teacher expertise (subcategory)
 */
export const updateTeacherExpertise = async (
  subcategoryId: string
): Promise<ApiResponse> => {
  return apiClient.patch('/profile/expertise', { subcategoryId });
};
