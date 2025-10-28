// Application constants

// Supabase storage bucket names
export const STORAGE_BUCKETS = {
  PET_IMAGES: 'pet-images',
  PROVIDER_IMAGES: 'provider-images',
  PRODUCT_IMAGES: 'product-images',
  HEALTH_RECORDS: 'health-records',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  PROFILE_IMAGES: 'profile-images'
};

// API endpoints
export const API_ENDPOINTS = {
  TRIAGE: '/api/triage',
  CONSULTATION: '/api/consultation',
  PAYMENT: '/api/payment',
  NOTIFICATIONS: '/api/notifications'
};

// User roles
export const USER_ROLES = {
  PET_OWNER: 'pet_owner',
  VETERINARIAN: 'veterinarian',
  VET_NURSE: 'vet_nurse',
  GROOMER: 'groomer',
  TRAINER: 'trainer',
  BREEDER: 'breeder',
  NUTRITIONIST: 'nutritionist',
  PET_BUSINESS: 'pet_business',
  HOLISTIC_CARE: 'holistic_care',
  ADMIN: 'admin',
  SUPPORT: 'support'
};

// Listing types
export const LISTING_TYPES = {
  SERVICE: 'service',
  PRODUCT: 'product',
  PROVIDER: 'provider'
};

// Case status
export const CASE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Urgency levels
export const URGENCY_LEVELS = {
  EMERGENCY: 'emergency',
  URGENT: 'urgent',
  ROUTINE: 'routine',
  NON_URGENT: 'non_urgent'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
};

// Time constants
export const TIME_CONSTANTS = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  DEBOUNCE_DELAY: 300, // milliseconds
  TOAST_DURATION: 3000 // milliseconds
};

export default {
  STORAGE_BUCKETS,
  API_ENDPOINTS,
  USER_ROLES,
  LISTING_TYPES,
  CASE_STATUS,
  URGENCY_LEVELS,
  PAGINATION,
  FILE_LIMITS,
  TIME_CONSTANTS
};
