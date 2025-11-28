// src/lib/hooks/useCategories.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { Category } from '@/types';

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

/**
 * Fetch all categories with subcategories
 */
export const useCategories = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoriesResponse> => {
      return apiClient.get('/categories');
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    categories: data?.data?.categories || [],
    isLoading,
    error,
  };
};

/**
 * Fetch single category by ID
 */
export const useCategory = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      return apiClient.get(`/categories/${id}`);
    },
    enabled: !!id,
  });

  return {
    category: data?.data?.category,
    isLoading,
    error,
  };
};