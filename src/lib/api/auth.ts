// src/lib/api/auth.ts - Authentication API calls

import apiClient from './client';
import {
  ApiResponse,
  LoginCredentials,
  RegisterStudentData,
  RegisterTeacherData,
  RegisterParentData,
  User
} from '@/types';

interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: string;
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/auth/login', credentials);
};

/**
 * Register student
 */
export const registerStudent = async (data: RegisterStudentData): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/auth/register', data);
};

/**
 * Register teacher
 */
export const registerTeacher = async (data: RegisterTeacherData): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/auth/register', data);
};

/**
 * Register parent
 */
export const registerParent = async (data: RegisterParentData): Promise<ApiResponse<AuthResponse>> => {
  return apiClient.post('/auth/register', data);
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<ApiResponse<{ user: User }>> => {
  return apiClient.get('/auth/me');
};

/**
 * Logout user
 */
export const logout = async (): Promise<ApiResponse> => {
  return apiClient.post('/auth/logout');
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string): Promise<ApiResponse> => {
  return apiClient.get(`/auth/verify-email/${token}`);
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email: string): Promise<ApiResponse> => {
  return apiClient.post('/auth/resend-verification', { email });
};

/**
 * Forgot password
 */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  return apiClient.post('/auth/forgot-password', { email });
};

/**
 * Reset password
 */
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  return apiClient.post('/auth/reset-password', { token, newPassword });
};