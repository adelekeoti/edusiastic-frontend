// src/lib/validations/auth.schema.ts

import { z } from 'zod';
import { LearningPreference } from '@/types';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

// Student registration schema
export const studentRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  subcategoryIds: z
    .array(z.string())
    .min(1, 'Please select at least 1 interest')
    .max(9, 'You can select up to 9 interests only'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().or(z.literal('')),
  school: z.string().max(100, 'School name cannot exceed 100 characters').optional().or(z.literal('')),
  class: z.string().max(50, 'Class cannot exceed 50 characters').optional().or(z.literal('')),
  isProfilePublic: z.boolean().optional()
});

// Teacher registration schema
export const teacherRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  subcategoryId: z.string().min(1, 'Please select your area of expertise'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().or(z.literal('')),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  certifications: z.string().max(1000).optional().or(z.literal('')),
  isAvailableForHomeTutoring: z.boolean().optional()
});

// Parent registration schema
export const parentRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  children: z
    .array(
      z.object({
        name: z.string().min(2, 'Child name must be at least 2 characters'),
        class: z.string().min(1, 'Class is required'),
        studentId: z.string().optional()
      })
    )
    .min(1, 'Please add at least one child'),
  subcategoryIds: z
    .array(z.string())
    .min(1, 'Please select at least 1 subject of interest')
    .max(9, 'You can select up to 9 subjects'),
  learningPreference: z.nativeEnum(LearningPreference, {
    message: 'Please select a learning preference' 
  }),
  bio: z.string().max(500).optional().or(z.literal(''))
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;
export type TeacherRegistrationFormData = z.infer<typeof teacherRegistrationSchema>;
export type ParentRegistrationFormData = z.infer<typeof parentRegistrationSchema>;