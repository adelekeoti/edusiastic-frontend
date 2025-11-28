// src/lib/api/notifications.ts

import apiClient from './client';
import { ApiResponse, PaginatedResponse, Notification } from '@/types';

export const getNotifications = async (
  page = 1,
  limit = 20,
  unreadOnly = false
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString()
  });
  return apiClient.get(`/notifications?${params}`) as Promise<PaginatedResponse<Notification>>;
};

export const markAsRead = async (id: string) => {
  return apiClient.put(`/notifications/${id}/read`) as Promise<ApiResponse>;
};

export const markAllAsRead = async () => {
  return apiClient.put('/notifications/mark-all-read') as Promise<ApiResponse>;
};

export const deleteNotification = async (id: string) => {
  return apiClient.delete(`/notifications/${id}`) as Promise<ApiResponse>;
};

export const getUnreadCount = async () => {
  return apiClient.get('/notifications/unread-count') as Promise<ApiResponse<{ unreadCount: number }>>;
};