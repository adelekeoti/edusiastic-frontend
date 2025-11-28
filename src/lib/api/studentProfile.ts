// src/lib/api/studentProfile.ts
import apiClient from './client';
import { ApiResponse, User } from '@/types';

export interface StudentInterest {
  id: string;
  subcategoryId: string;
  subcategoryName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
}

export interface StudentProfile extends User {
  interests: StudentInterest[];
}

export interface UpdateStudentProfileData {
  bio?: string;
  school?: string;
  class?: string;
  isProfilePublic?: boolean;
}

// ==================== GET PROFILE ====================

export const getStudentProfile = async (): Promise<ApiResponse<{ profile: StudentProfile }>> => {
  return apiClient.get('/student-profile');
};

export const getPublicStudentProfile = async (
  studentId: string
): Promise<ApiResponse<{ profile: StudentProfile }>> => {
  return apiClient.get(`/student-profile/${studentId}`);
};

// ==================== UPDATE PROFILE ====================

export const updateStudentProfile = async (
  data: UpdateStudentProfileData
): Promise<ApiResponse<{ profile: Partial<User> }>> => {
  return apiClient.patch('/student-profile', data);
};

export const uploadStudentProfilePicture = async (
  file: File
): Promise<ApiResponse<{ profile: Partial<User> }>> => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  return apiClient.post('/student-profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ==================== UPDATE INTERESTS ====================

export const updateStudentInterests = async (
  subcategoryIds: string[]
): Promise<ApiResponse<{ interests: StudentInterest[]; total: number }>> => {
  return apiClient.patch('/student-profile/interests', { subcategoryIds });
};

// ==================== DELETE ACCOUNT ====================

export const deleteStudentAccount = async (
  password: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete('/student-profile', { data: { password } });
};