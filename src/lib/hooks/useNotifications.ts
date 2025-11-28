// src/lib/hooks/useNotifications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '@/lib/api/notifications';
import { toast } from 'sonner';

export const useNotifications = (page = 1, limit = 20, unreadOnly = false) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', page, limit, unreadOnly],
    queryFn: () => notificationApi.getNotifications(page, limit, unreadOnly),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30000,
    retry: 1
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    }
  });

  // Handle the response structure - apiClient already extracts response.data
  // So 'data' here is already the response body
  const notifications = Array.isArray(data?.data) 
    ? data.data 
    : Array.isArray(data) 
    ? data 
    : [];

  return {
    notifications,
    unreadCount: unreadCountData?.data?.unreadCount || 0,
    pagination: data?.pagination,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate
  };
};