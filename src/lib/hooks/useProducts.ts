// src/lib/hooks/useProducts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productApi from '@/lib/api/products';
import { ProductFilters } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// For browsing/searching all products (student view, marketplace, etc.)
export const useProducts = (filters?: ProductFilters) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getAllProducts(filters)
  });

  return {
    products: data?.data?.products || [],
    pagination: data?.data?.pagination,
    isLoading,
    error
  };
};

// For teachers to manage their own products (including pending/rejected)
export const useTeacherProducts = (teacherId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-products', teacherId],
    queryFn: async () => {
      // Fetch with includeAll parameter to get all statuses
      const response = await productApi.getTeacherProducts(teacherId);
      return response;
    },
    enabled: !!teacherId, // Only fetch when we have a teacherId
  });

  return {
    products: data?.data?.products || [],
    pagination: data?.data?.pagination,
    isLoading,
    error
  };
};

// Get a single product by ID
export const useProduct = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id
  });

  return {
    product: data?.data?.product,
    isLoading,
    error
  };
};

// Create a new product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-products'] });
      toast.success('Product created successfully! Pending admin approval.');
      router.push('/teacher/products');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    }
  });
};

// Update an existing product
export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: FormData) => productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Product updated successfully');
      router.push('/teacher/products');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    }
  });
};

// Delete a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });
};