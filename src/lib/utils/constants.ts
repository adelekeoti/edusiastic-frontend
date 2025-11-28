// src/lib/utils/constants.ts - Application constants

export const APP_NAME = 'Edusiastic';
export const APP_DESCRIPTION = 'Connect with expert teachers and unlock your learning potential';

export const PRODUCT_TYPES = [
  { value: 'SUBSCRIPTION', label: 'Subscription' },
  { value: 'PDF', label: 'PDF Resource' },
  { value: 'HOME_TUTORING', label: 'Home Tutoring' }
];

export const SUBSCRIPTION_DURATIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' }
];

export const PRICING_TYPES = [
  { value: 'HOURLY', label: 'Hourly Rate' },
  { value: 'MONTHLY', label: 'Monthly Package' }
];

export const SESSION_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' }
];

export const DEGREE_TYPES = [
  { value: 'PHD', label: 'PhD' },
  { value: 'MASTERS', label: 'Masters' },
  { value: 'BACHELORS', label: 'Bachelors' },
  { value: 'HND', label: 'HND' },
  { value: 'NCE', label: 'NCE' },
  { value: 'OND', label: 'OND' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' }
];

export const TITLES = [
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms.', label: 'Ms.' }
];

export const LEARNING_PREFERENCES = [
  { value: 'ONLINE', label: 'Online Only' },
  { value: 'PHYSICAL', label: 'Physical Only' },
  { value: 'BOTH', label: 'Both Online & Physical' }
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];
export const ALLOWED_DOC_TYPES = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];