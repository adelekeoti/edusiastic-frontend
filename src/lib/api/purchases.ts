// src/lib/api/purchases.ts - Purchases & Subscriptions API Service

import apiClient from './client';
import { ApiResponse, Product, User } from '@/types';

// ==================== TYPES ====================

export interface ProductPurchase {
  id: string;
  productId: string;
  studentId: string;
  childId?: string;
  purchaseDate: string;
  
  // Subscription specific
  subscriptionStatus?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate?: string;
  endDate?: string;
  isAutoRenewal: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Refund related
  canRequestRefund: boolean;
  refundDeadline?: string;
  
  // Relations
  product?: Product & {
    teacher?: User;
  };
  child?: {
    id: string;
    name: string;
    class: string;
  };
}

export interface PurchasesResponse {
  purchases: ProductPurchase[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== GET MY PURCHASES ====================

export const getMyPurchases = async (params?: {
  type?: 'SUBSCRIPTION' | 'PDF' | 'HOME_TUTORING';
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PurchasesResponse>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  return apiClient.get(`/purchases${queryString ? `?${queryString}` : ''}`);
};

// ==================== SUBSCRIPTION MANAGEMENT ====================

export const toggleAutoRenewal = async (
  purchaseId: string,
  isAutoRenewal: boolean
): Promise<ApiResponse<{ purchase: ProductPurchase }>> => {
  return apiClient.patch(`/purchases/${purchaseId}/auto-renewal`, { isAutoRenewal });
};

export const cancelSubscription = async (
  purchaseId: string,
  reason?: string
): Promise<ApiResponse<{ purchase: ProductPurchase }>> => {
  return apiClient.post(`/purchases/${purchaseId}/cancel`, { reason });
};

export const renewSubscription = async (
  purchaseId: string
): Promise<ApiResponse<{ 
  authorizationUrl: string;
  reference: string;
}>> => {
  return apiClient.post(`/purchases/${purchaseId}/renew`);
};

// ==================== ACCESS CONTENT ====================

export const getPDFDownloadUrl = async (
  productId: string
): Promise<ApiResponse<{ downloadUrl: string; product: Product }>> => {
  return apiClient.get(`/purchases/pdf/${productId}`);
};

export const accessCourseContent = async (
  productId: string
): Promise<ApiResponse<{ 
  product: Product;
  meetingLink?: string;
  hasAccess: boolean;
}>> => {
  return apiClient.get(`/purchases/access/${productId}`);
};

// ==================== PURCHASE DETAILS ====================

export const getPurchaseById = async (
  purchaseId: string
): Promise<ApiResponse<{ purchase: ProductPurchase }>> => {
  return apiClient.get(`/purchases/${purchaseId}`);
};