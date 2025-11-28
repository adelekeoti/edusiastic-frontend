// src/lib/api/postApi.ts - Posts API Service

import apiClient from './client';
import { ApiResponse, PaginatedResponse, Post } from '@/types';

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreatePostData {
  title: string;
  content: string;
  lessonGroupId?: string;
  image?: File;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  image?: File;
}

export interface PostFilters {
  page?: number;
  limit?: number;
}

// ==================== POST CRUD ====================

export const createPost = async (data: CreatePostData): Promise<ApiResponse<{ post: Post }>> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  
  if (data.lessonGroupId) {
    formData.append('lessonGroupId', data.lessonGroupId);
  }
  
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiClient.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMyPosts = async (filters?: PostFilters): Promise<PaginatedResponse<Post>> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const queryString = params.toString();
  return apiClient.get(`/posts/my-posts${queryString ? `?${queryString}` : ''}`);
};

export const getDiscoverFeed = async (filters?: PostFilters): Promise<PaginatedResponse<Post>> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const queryString = params.toString();
  return apiClient.get(`/posts/discover${queryString ? `?${queryString}` : ''}`);
};

export const getPostById = async (id: string): Promise<ApiResponse<{ post: Post }>> => {
  return apiClient.get(`/posts/${id}`);
};

export const updatePost = async (
  id: string,
  data: UpdatePostData
): Promise<ApiResponse<{ post: Post }>> => {
  const formData = new FormData();
  
  if (data.title) {
    formData.append('title', data.title);
  }
  
  if (data.content) {
    formData.append('content', data.content);
  }
  
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiClient.put(`/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deletePost = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/posts/${id}`);
};

// ==================== POST INTERACTIONS ====================

export const toggleLike = async (id: string): Promise<ApiResponse<{ liked: boolean; action: string }>> => {
  return apiClient.post(`/posts/${id}/like`);
};

// ==================== POST STATISTICS ====================

export interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  postsThisMonth: number;
  averageEngagement: number;
}

export const getPostStats = async (): Promise<ApiResponse<{ stats: PostStats }>> => {
  return apiClient.get('/posts/stats');
};

// ==================== VALIDATION HELPERS ====================

export const validateWordCount = (content: string): { valid: boolean; count: number } => {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  return {
    valid: words.length <= 100,
    count: words.length,
  };
};

export const validateImageSize = (file: File): { valid: boolean; size: number; sizeInMB: number } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const sizeInMB = file.size / (1024 * 1024);
  return {
    valid: file.size <= maxSize,
    size: file.size,
    sizeInMB: parseFloat(sizeInMB.toFixed(2)),
  };
};

export const validateImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};