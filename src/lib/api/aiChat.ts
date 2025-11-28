// src/lib/api/aiChat.ts - AI Chat API Service

import apiClient from './client';
import { ApiResponse } from '@/types';

// ==================== TYPES ====================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TeacherRecommendation {
  id: string;
  firstName: string;
  lastName: string;
  expertise: string;
  averageRating: number;
  totalStudents: number;
  profileImage?: string;
}

export interface ProductRecommendation {
  id: string;
  title: string;
  type: 'SUBSCRIPTION' | 'PDF' | 'HOME_TUTORING';
  price: number;
  teacherName: string;
  imageUrl?: string;
}

export interface Recommendations {
  teachers: TeacherRecommendation[];
  products: ProductRecommendation[];
}

export interface ChatConversation {
  id: string;
  lastMessage: string;
  messageCount: number;
  hasRecommendations: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== START CONVERSATION ====================

export const startConversation = async (): Promise<ApiResponse<{
  chatId: string;
  message: string;
  recommendations: Recommendations;
}>> => {
  return apiClient.post('/ai-chat/start');
};

// ==================== SEND MESSAGE ====================

export const sendMessage = async (
  message: string,
  chatId?: string
): Promise<ApiResponse<{
  chatId: string;
  message: string;
  recommendations: Recommendations;
}>> => {
  return apiClient.post('/ai-chat/message', {
    message,
    chatId: chatId || null
  });
};

// ==================== GET CHAT HISTORY ====================

export const getChatHistory = async (
  chatId: string
): Promise<ApiResponse<{
  chatId: string;
  messages: ChatMessage[];
  recommendations: Recommendations | null;
  createdAt: string;
  updatedAt: string;
}>> => {
  return apiClient.get(`/ai-chat/history/${chatId}`);
};

// ==================== GET ALL CONVERSATIONS ====================

export const getAllConversations = async (): Promise<ApiResponse<{
  conversations: ChatConversation[];
}>> => {
  return apiClient.get('/ai-chat/conversations');
};

// ==================== DELETE CONVERSATION ====================

export const deleteConversation = async (
  chatId: string
): Promise<ApiResponse> => {
  return apiClient.delete(`/ai-chat/${chatId}`);
};