// src/types/index.ts - Complete Type Definitions

// ==================== ENUMS ====================

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  ADMIN = 'ADMIN'
}

export enum LearningPreference {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
  BOTH = 'BOTH'
}

export enum GroupType {
  LESSON = 'LESSON',
  SUPPORT = 'SUPPORT'
}

export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  PDF = 'PDF',
  HOME_TUTORING = 'HOME_TUTORING'
}

export enum SubscriptionDuration {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum HomeTutoringPricingType {
  HOURLY = 'HOURLY',
  MONTHLY = 'MONTHLY'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum SubmissionType {
  TEXT = 'TEXT',
  URL = 'URL',
  DOCX = 'DOCX'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  GRADED = 'GRADED'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum RefundStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum MessageType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum NotificationType {
  ASSIGNMENT_POSTED = 'ASSIGNMENT_POSTED',
  ASSIGNMENT_GRADED = 'ASSIGNMENT_GRADED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  PRODUCT_PURCHASED = 'PRODUCT_PURCHASED',
  SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
  NEW_RATING = 'NEW_RATING',
  REFUND_STATUS = 'REFUND_STATUS',
  GROUP_JOINED = 'GROUP_JOINED',
  POST_PUBLISHED = 'POST_PUBLISHED',
  TEACHER_VERIFIED = 'TEACHER_VERIFIED',
  TEACHER_REJECTED = 'TEACHER_REJECTED'
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TeacherStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum DegreeType {
  PHD = 'PHD',
  MASTERS = 'MASTERS',
  BACHELORS = 'BACHELORS',
  HND = 'HND',
  NCE = 'NCE',
  OND = 'OND',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER'
}

// ==================== USER TYPES ====================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  school?: string;
  class?: string;
  isVerified: boolean;
  isProfilePublic: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Teacher specific
  averageRating?: number;
  totalRatings?: number;
  totalStudents?: number;
  yearsOfExperience?: number;
  certifications?: string;
  isAvailableForHomeTutoring?: boolean;
  headline?: string;
  title?: string;
  specializations?: string[];
  currentWorkplace?: string;
  currentPosition?: string;
  isCurrentlyWorking?: boolean;
  teachingPhilosophy?: string;
  achievements?: string[];
  languagesSpoken?: string[];
  profileCompletenessScore?: number;
  teacherStatus?: TeacherStatus;
  
  // Parent specific
  learningPreference?: LearningPreference;
  teacherExpertise?: TeacherExpertise;
}

// ==================== CATEGORY TYPES ====================

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  subcategories?: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  isActive: boolean;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherExpertise {
  id: string;
  userId: string;
  subcategoryId: string;
  subcategory?: Subcategory;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  class: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PRODUCT TYPES ====================

export interface Product {
  id: string;
  title: string;
  description: string;
  type: ProductType;
  price: number;
  teacherId: string;
  subcategoryId: string;
  
  duration?: SubscriptionDuration;
  autoRenewal?: boolean;
  meetingLink?: string;
  
  pdfUrl?: string;
  pdfFileSize?: number;
  
  coverageAreas?: string[];
  pricingType?: HomeTutoringPricingType;
  hourlyRate?: number;
  sessionsPerWeek?: number;
  sessionDuration?: number;
  availabilitySchedule?: Record<string, any>;
  minimumCommitment?: number;
  transportFee?: number;
  subjects?: string[];
  examPreparation?: string[];
  
  isApproved: boolean;
  isActive: boolean;
  salesCount: number;
  viewCount: number;
  
  teacher?: User;
  subcategory?: Subcategory;
  images?: ProductImage[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  fileSize: number;
  order: number;
  createdAt: string;
}

export interface ProductFilters {
  categoryId?: string;
  subcategoryId?: string;
  type?: 'SUBSCRIPTION' | 'PDF';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  teacherId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  sortBy?: 'createdAt' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // Additional data related to the notification
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== POST TYPES ====================

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  teacherId: string;
  lessonGroupId?: string;
  likesCount: number;
  viewsCount: number;
  hasLiked?: boolean;
  teacher?: User;
  createdAt: string;
  updatedAt: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

// ==================== FORM TYPES ====================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterStudentData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT';
  subcategoryIds: string[];
  bio?: string;
  school?: string;
  class?: string;
  isProfilePublic?: boolean;
}

export interface RegisterTeacherData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'TEACHER';
  subcategoryId: string;
  bio?: string;
  yearsOfExperience?: number;
  certifications?: string;
  isAvailableForHomeTutoring?: boolean;
}

export interface RegisterParentData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'PARENT';
  children: Array<{
    name: string;
    class: string;
    studentId?: string;
  }>;
  subcategoryIds: string[];
  learningPreference: LearningPreference;
  bio?: string;
}
// ==================== GROUP TYPES ====================

export interface LessonGroup {
  id: string;
  name: string;
  description?: string;
  groupType: GroupType;
  teacherId: string;
  productId?: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  teacher?: User;
  product?: Product;
  members?: GroupMember[];
  _count?: {
    members: number;
    assignments: number;
    posts: number;
    messages?: number;
  };
}

export interface GroupMember {
  id: string;
  studentId: string;
  lessonGroupId: string;
  joinedAt: string;
  student?: User;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  groupType: GroupType;
  productId?: string;
  maxStudents?: number;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface GroupFilters {
  groupType?: 'LESSON' | 'SUPPORT';
  page?: number;
  limit?: number;
}

// ==================== ASSIGNMENT TYPES ====================

export interface Assignment {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  lessonGroupId: string;
  dueDate?: string;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  
  teacher?: User;
  lessonGroup?: {
    id: string;
    name: string;
    teacherId?: string;
  };
  _count?: {
    submissions: number;
  };
  submissions?: Submission[];
  mySubmission?: Submission;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  type: SubmissionType;
  content?: string;
  fileUrl?: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  
  student?: User;
  assignment?: Assignment;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  lessonGroupId: string;
  dueDate?: string;
  totalPoints?: number;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  dueDate?: string;
  totalPoints?: number;
}

export interface SubmitAssignmentData {
  assignmentId: string;
  type: SubmissionType;
  content?: string;
  file?: File;
}

export interface GradeSubmissionData {
  grade: number;
  feedback?: string;
}