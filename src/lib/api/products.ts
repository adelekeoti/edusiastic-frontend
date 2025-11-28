// src/lib/api/products.ts

import apiClient from './client';
import { ApiResponse, PaginatedResponse, PaginationMeta, Product, ProductFilters } from '@/types';

// Custom response type for products endpoint (matches actual backend structure)
interface ProductsApiResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: PaginationMeta;
  };
}

/**
 * Get all products with filters
 */
export const getAllProducts = async (filters?: ProductFilters): Promise<ProductsApiResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  return apiClient.get(`/products?${params}`);
};

/**
 * Get teacher's own products (including pending and rejected)
 * This is specifically for teachers to manage their products
 */
export const getTeacherProducts = async (teacherId?: string): Promise<ProductsApiResponse> => {
  if (!teacherId) {
    throw new Error('Teacher ID is required');
  }
  
  // Add includeAll parameter to bypass approval filter
  const params = new URLSearchParams({
    teacherId: teacherId,
    includeAll: 'true' // This tells backend to return all statuses
  });
  
  return apiClient.get(`/products?${params}`);
};

/**
 * Get single product by ID
 */
export const getProductById = async (id: string): Promise<ApiResponse<{ product: Product }>> => {
  return apiClient.get(`/products/${id}`);
};

/**
 * Create product (Teacher only)
 */
export const createProduct = async (data: FormData): Promise<ApiResponse<{ product: Product }>> => {
  return apiClient.post('/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Update product (Teacher only)
 */
export const updateProduct = async (id: string, data: FormData): Promise<ApiResponse<{ product: Product }>> => {
  return apiClient.put(`/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Delete product (Teacher only)
 */
export const deleteProduct = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/products/${id}`);
};

/**
 * Get teacher's products (legacy - keeping for compatibility)
 */
export const getMyProducts = async (page = 1, limit = 20): Promise<ProductsApiResponse> => {
  return apiClient.get(`/products?page=${page}&limit=${limit}&teacherId=me`);
};