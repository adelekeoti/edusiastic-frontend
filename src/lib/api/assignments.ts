// src/lib/api/assignments.ts - Fixed Assignments API Service

import apiClient from './client';
import { ApiResponse, Assignment, Submission, CreateAssignmentData, UpdateAssignmentData, SubmitAssignmentData, GradeSubmissionData } from '@/types';

// ==================== ASSIGNMENT CRUD ====================

export const createAssignment = async (data: CreateAssignmentData): Promise<ApiResponse<{ assignment: Assignment }>> => {
  return apiClient.post('/assignments', data);
};

export const getAllAssignments = async (groupId?: string, page = 1, limit = 20): Promise<ApiResponse<{
  assignments: Assignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>> => {
  const params = new URLSearchParams();
  if (groupId) params.append('groupId', groupId);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return apiClient.get(`/assignments?${params.toString()}`);
};

export const getAssignmentById = async (id: string): Promise<ApiResponse<{ assignment: Assignment }>> => {
  return apiClient.get(`/assignments/${id}`);
};

export const updateAssignment = async (id: string, data: UpdateAssignmentData): Promise<ApiResponse<{ assignment: Assignment }>> => {
  return apiClient.put(`/assignments/${id}`, data);
};

export const deleteAssignment = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/assignments/${id}`);
};

// ==================== SUBMISSIONS ====================

export const submitAssignment = async (data: SubmitAssignmentData): Promise<ApiResponse<{ submission: Submission }>> => {
  const formData = new FormData();
  
  // CRITICAL: Ensure assignmentId and type are always added
  if (!data.assignmentId) {
    throw new Error('Assignment ID is required');
  }
  if (!data.type) {
    throw new Error('Submission type is required');
  }

  formData.append('assignmentId', data.assignmentId);
  formData.append('type', data.type);
  
  // Add content based on submission type
  if (data.type === 'TEXT' && data.content) {
    formData.append('content', data.content);
  } else if (data.type === 'URL' && data.content) {
    formData.append('url', data.content); // Changed from 'content' to 'url'
  } else if (data.type === 'DOCX' && data.file) {
    formData.append('file', data.file);
  }

  // Debug logging
  console.log('FormData being sent:');
  console.log('- assignmentId:', data.assignmentId);
  console.log('- type:', data.type);
  console.log('- content:', data.content ? 'present' : 'null');
  console.log('- file:', data.file ? data.file.name : 'null');

  return apiClient.post('/assignments/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getMySubmissions = async (page = 1, limit = 20): Promise<ApiResponse<{
  submissions: Submission[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>> => {
  return apiClient.get(`/assignments/submissions/my-submissions?page=${page}&limit=${limit}`);
};

export const getAssignmentSubmissions = async (assignmentId: string): Promise<ApiResponse<{ submissions: Submission[] }>> => {
  return apiClient.get(`/assignments/submissions/assignment/${assignmentId}`);
};

export const gradeSubmission = async (submissionId: string, data: GradeSubmissionData): Promise<ApiResponse<{ submission: Submission }>> => {
  return apiClient.put(`/assignments/submissions/${submissionId}/grade`, data);
};