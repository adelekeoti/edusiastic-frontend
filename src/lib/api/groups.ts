// src/lib/api/groups.ts - Groups API Service

import apiClient from './client';
import { ApiResponse, LessonGroup, GroupMember, CreateGroupData, UpdateGroupData, GroupFilters } from '@/types';

// ==================== GROUP CRUD ====================

export const createGroup = async (data: CreateGroupData): Promise<ApiResponse<{ group: LessonGroup }>> => {
  return apiClient.post('/groups', data);
};

export const getAllGroups = async (filters?: GroupFilters): Promise<ApiResponse<{
  groups: LessonGroup[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>> => {
  const params = new URLSearchParams();
  if (filters?.groupType) params.append('groupType', filters.groupType);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const queryString = params.toString();
  return apiClient.get(`/groups${queryString ? `?${queryString}` : ''}`);
};

export const getGroupById = async (id: string): Promise<ApiResponse<{ group: LessonGroup }>> => {
  return apiClient.get(`/groups/${id}`);
};

export const updateGroup = async (id: string, data: UpdateGroupData): Promise<ApiResponse<{ group: LessonGroup }>> => {
  return apiClient.put(`/groups/${id}`, data);
};

export const deleteGroup = async (id: string): Promise<ApiResponse> => {
  return apiClient.delete(`/groups/${id}`);
};

// ==================== MEMBER MANAGEMENT ====================

export const getGroupMembers = async (groupId: string): Promise<ApiResponse<{
  members: GroupMember[];
  total: number;
  maxStudents: number;
}>> => {
  return apiClient.get(`/groups/${groupId}/members`);
};

export const addMemberToGroup = async (groupId: string, studentId: string): Promise<ApiResponse<{ member: GroupMember }>> => {
  return apiClient.post(`/groups/${groupId}/members`, { studentId });
};

export const removeMemberFromGroup = async (groupId: string, studentId: string): Promise<ApiResponse> => {
  return apiClient.delete(`/groups/${groupId}/members/${studentId}`);
};

export const leaveGroup = async (groupId: string): Promise<ApiResponse> => {
  return apiClient.post(`/groups/${groupId}/leave`);
};