// src/lib/api/posts.ts - Posts API Service

import apiClient from './client';
import { ApiResponse, Post } from '@/types';

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

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== VALIDATION HELPERS ====================

export const validateWordCount = (content: string): { valid: boolean; count: number } => {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  return {
    valid: words.length <= 100,
    count: words.length
  };
};

export const validateImageSize = (file: File): { valid: boolean; sizeInMB: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  return {
    valid: file.size <= maxSize,
    sizeInMB
  };
};

export const validateImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};

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
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getMyPosts = async (params: PaginationParams = {}): Promise<ApiResponse<PostsResponse>> => {
  const { page = 1, limit = 20 } = params;
  return apiClient.get(`/posts/my-posts?page=${page}&limit=${limit}`);
};

export const getDiscoverFeed = async (params: PaginationParams = {}): Promise<ApiResponse<PostsResponse>> => {
  const { page = 1, limit = 10 } = params;
  return apiClient.get(`/posts/discover?page=${page}&limit=${limit}`);
};

export const getPostById = async (id: string): Promise<ApiResponse<{ post: Post }>> => {
  return apiClient.get(`/posts/${id}`);
};

export const updatePost = async (id: string, data: UpdatePostData): Promise<ApiResponse<{ post: Post }>> => {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.content) formData.append('content', data.content);
  if (data.image) formData.append('image', data.image);

  return apiClient.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deletePost = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/posts/${id}`);
};

export const toggleLike = async (postId: string): Promise<ApiResponse<{ liked: boolean; action: string }>> => {
  return apiClient.post(`/posts/${postId}/like`);
};

// ==================== STATS (Optional - for future use) ====================

export const getPostStats = async (): Promise<ApiResponse<{ stats: any }>> => {
  return apiClient.get('/posts/stats');
};