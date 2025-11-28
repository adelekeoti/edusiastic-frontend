// src/lib/api/parentProfile.ts
import apiClient from './client';
import { ApiResponse, User } from '@/types';

export interface ParentInterest {
  id: string;
  subcategoryId: string;
  subcategoryName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
}

export interface Child {
  id: string;
  name: string;
  class: string;
  studentId?: string;
  linkedStudent?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export interface ParentProfile extends User {
  interests: ParentInterest[];
  children: Child[];
}

export interface UpdateParentProfileData {
  bio?: string;
  learningPreference?: 'ONLINE' | 'PHYSICAL' | 'BOTH';
  isProfilePublic?: boolean;
}

export interface AddChildData {
  name: string;
  class: string;
  studentId?: string;
}

export interface UpdateChildData {
  name?: string;
  class?: string;
  studentId?: string;
}

// ==================== GET PROFILE ====================

export const getParentProfile = async (): Promise<ApiResponse<{ profile: ParentProfile }>> => {
  return apiClient.get('/parent-profile');
};

export const getPublicParentProfile = async (
  parentId: string
): Promise<ApiResponse<{ profile: ParentProfile }>> => {
  return apiClient.get(`/parent-profile/${parentId}`);
};

// ==================== UPDATE PROFILE ====================

export const updateParentProfile = async (
  data: UpdateParentProfileData
): Promise<ApiResponse<{ profile: Partial<User> }>> => {
  return apiClient.patch('/parent-profile', data);
};

export const uploadParentProfilePicture = async (
  file: File
): Promise<ApiResponse<{ profile: Partial<User> }>> => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  return apiClient.post('/parent-profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ==================== UPDATE INTERESTS ====================

export const updateParentInterests = async (
  subcategoryIds: string[]
): Promise<ApiResponse<{ interests: ParentInterest[]; total: number }>> => {
  return apiClient.patch('/parent-profile/interests', { subcategoryIds });
};

// ==================== CHILDREN MANAGEMENT ====================

export const addChild = async (
  data: AddChildData
): Promise<ApiResponse<{ child: Child }>> => {
  return apiClient.post('/parent-profile/children', data);
};

export const updateChild = async (
  childId: string,
  data: UpdateChildData
): Promise<ApiResponse<{ child: Child }>> => {
  return apiClient.patch(`/parent-profile/children/${childId}`, data);
};

export const deleteChild = async (
  childId: string
): Promise<ApiResponse> => {
  return apiClient.delete(`/parent-profile/children/${childId}`);
};

// ==================== DELETE ACCOUNT ====================

export const deleteParentAccount = async (
  password: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete('/parent-profile', { data: { password } });
};