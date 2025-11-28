// src/lib/api/payments.ts - Payment API Service

import apiClient from './client';
import { ApiResponse } from '@/types';

// ==================== TYPES ====================

export interface InitializePaymentData {
  productId: string;
  childId?: string; // For parent purchases
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  amount: number;
  product: {
    id: string;
    title: string;
    type: string;
  };
  child?: {
    id: string;
    name: string;
    class: string;
  };
}

export interface VerifyPaymentResponse {
  transaction: {
    reference: string;
    status: string;
    amount: number;
    product: {
      id: string;
      title: string;
      type: string;
    };
    purchasedFor?: string;
  };
}

export interface PaymentHistoryItem {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  platformFee: number;
  teacherAmount: number;
  type: string;
  status: string;
  paystackRef: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    type: string;
    teacher?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface PaymentHistoryResponse {
  transactions: PaymentHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Initialize payment for a product
 */
export const initializePayment = async (
  data: InitializePaymentData
): Promise<ApiResponse<InitializePaymentResponse>> => {
  return apiClient.post('/payments/initialize', data);
};

/**
 * Verify payment with reference
 */
export const verifyPayment = async (
  reference: string
): Promise<ApiResponse<VerifyPaymentResponse>> => {
  return apiClient.get(`/payments/verify?reference=${reference}`);
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaymentHistoryResponse>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  return apiClient.get(`/payments/history${queryString ? `?${queryString}` : ''}`);
};