// src/lib/api/profile.ts - Profile API Service

import apiClient from './client';
import { ApiResponse, User, TeacherExpertise } from '@/types';

export interface WorkExperience {
  id: string;
  teacherId: string;
  institution: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  teacherId: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
  isFeatured: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCertification {
  id: string;
  teacherId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCompleteness {
  score: number;
  missingFields: string[];
  breakdown: Record<string, number>;
  isPubliclyVisible: boolean;
  status: {
    status: string;
    message: string;
    color: string;
    icon: string;
  };
}

export interface TeacherProfile extends User {
  workExperiences: WorkExperience[];
  education: Education[];
  profileCertifications: ProfileCertification[];
  isVerified: boolean;
  verificationBadge?: {
    status: string;
    icon: string;
    text: string;
    verifiedAt: string;
  };
  receivedRatings?: Array<{
    id: string;
    overallRating: number;
    review?: string;
    createdAt: string;
    student: {
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  }>;
}

export interface ShareLinks {
  direct: string;
  whatsapp: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  email: string;
}

// ==================== BASIC PROFILE ====================

export const updateProfile = async (data: {
  bio?: string;
  yearsOfExperience?: number;
  isAvailableForHomeTutoring?: boolean;
}): Promise<ApiResponse<{ user: User }>> => {
  return apiClient.patch('/profile', data);
};

export const updateHomeTutoringAvailability = async (
  isAvailableForHomeTutoring: boolean
): Promise<ApiResponse<{ user: User }>> => {
  return apiClient.patch('/profile/home-tutoring', { isAvailableForHomeTutoring });
};

export const uploadProfilePicture = async (file: File): Promise<ApiResponse<{ user: User }>> => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  return apiClient.post('/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ==================== HEADLINE & TITLE ====================

export const updateHeadline = async (headline: string): Promise<ApiResponse<{ headline: string }>> => {
  return apiClient.post('/profile/headline', { headline });
};

export const getHeadlineSuggestion = async (): Promise<ApiResponse<{ suggestion: string }>> => {
  return apiClient.get('/profile/headline/suggestion');
};

export const updateTitle = async (title: string): Promise<ApiResponse<{ title: string }>> => {
  return apiClient.patch('/profile/title', { title });
};

export const updateSpecializations = async (
  specializations: string[]
): Promise<ApiResponse<{ specializations: string[] }>> => {
  return apiClient.patch('/profile/specializations', { specializations });
};

// ==================== CURRENT WORK ====================

export const updateCurrentWork = async (data: {
  currentWorkplace?: string;
  currentPosition?: string;
  isCurrentlyWorking: boolean;
}): Promise<ApiResponse> => {
  return apiClient.patch('/profile/current-work', data);
};

// ==================== WORK EXPERIENCE ====================

export const addWorkExperience = async (data: Omit<WorkExperience, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ workExperience: WorkExperience }>> => {
  return apiClient.post('/profile/work-experience', data);
};

export const getWorkExperiences = async (): Promise<ApiResponse<{ workExperiences: WorkExperience[]; total: number }>> => {
  return apiClient.get('/profile/work-experience');
};

export const updateWorkExperience = async (
  id: string,
  data: Omit<WorkExperience, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<{ workExperience: WorkExperience }>> => {
  return apiClient.patch(`/profile/work-experience/${id}`, data);
};

export const deleteWorkExperience = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/profile/work-experience/${id}`);
};

// ==================== EDUCATION ====================

export const addEducation = async (data: Omit<Education, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ education: Education }>> => {
  return apiClient.post('/profile/education', data);
};

export const getEducation = async (): Promise<ApiResponse<{ education: Education[]; total: number }>> => {
  return apiClient.get('/profile/education');
};

export const updateEducation = async (
  id: string,
  data: Omit<Education, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<{ education: Education }>> => {
  return apiClient.patch(`/profile/education/${id}`, data);
};

export const deleteEducation = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/profile/education/${id}`);
};

// ==================== CERTIFICATIONS ====================

export const addCertification = async (data: Omit<ProfileCertification, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ certification: ProfileCertification }>> => {
  return apiClient.post('/profile/certifications', data);
};

export const getCertifications = async (): Promise<ApiResponse<{ certifications: ProfileCertification[]; total: number }>> => {
  return apiClient.get('/profile/certifications');
};

export const updateCertification = async (
  id: string,
  data: Omit<ProfileCertification, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<{ certification: ProfileCertification }>> => {
  return apiClient.patch(`/profile/certifications/${id}`, data);
};

export const deleteCertification = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/profile/certifications/${id}`);
};

// ==================== ACHIEVEMENTS, LANGUAGES, PHILOSOPHY ====================

export const updateAchievements = async (
  achievements: string[]
): Promise<ApiResponse<{ achievements: string[] }>> => {
  return apiClient.patch('/profile/achievements', { achievements });
};

export const updateLanguages = async (
  languagesSpoken: string[]
): Promise<ApiResponse<{ languagesSpoken: string[] }>> => {
  return apiClient.patch('/profile/languages', { languagesSpoken });
};

export const updateTeachingPhilosophy = async (
  teachingPhilosophy: string
): Promise<ApiResponse<{ teachingPhilosophy: string }>> => {
  return apiClient.patch('/profile/teaching-philosophy', { teachingPhilosophy });
};

export const updateTeacherExpertise = async (
  subcategoryId: string
): Promise<ApiResponse<{ teacherExpertise: TeacherExpertise }>> => {
  return apiClient.patch('/profile/expertise', { subcategoryId });
};

// ==================== PROFILE COMPLETENESS & PREVIEW ====================

export const getProfileCompleteness = async (): Promise<ApiResponse<{ completeness: ProfileCompleteness }>> => {
  return apiClient.get('/profile/completeness');
};

export const getProfilePreview = async (): Promise<ApiResponse<{
  profile: TeacherProfile;
  completeness: ProfileCompleteness;
  warnings: string[];
}>> => {
  return apiClient.get('/profile/preview');
};

export const generateShareLink = async (): Promise<ApiResponse<{
  teacher: { id: string; name: string };
  shareLinks: ShareLinks;
  qrCodeUrl: string;
}>> => {
  return apiClient.get('/profile/share-link');
};

// ==================== PUBLIC PROFILE ====================

export const getTeacherProfile = async (teacherId: string): Promise<ApiResponse<{ teacher: TeacherProfile }>> => {
  return apiClient.get(`/profile/teacher/${teacherId}`);
};