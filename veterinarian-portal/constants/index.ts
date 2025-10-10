// Essential Constants for Veterinarian Portal

// Provider Types
export const PROVIDER_TYPES = {
  VETERINARIAN: 'veterinarian',
  VET_NURSE: 'vet_nurse',
  VET_TECH: 'vet_tech'
} as const;

// Animal Species
export const ANIMAL_SPECIES = {
  DOG: 'Dog',
  CAT: 'Cat',
  BIRD: 'Bird',
  RABBIT: 'Rabbit',
  OTHER: 'Other'
} as const;

// Status Types
export const STATUS_TYPES = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
} as const;

// Dashboard Sections
export const DASHBOARD_SECTIONS = {
  OVERVIEW: 'overview',
  PATIENTS: 'patients',
  PROFILE: 'profile'
} as const;

// Basic Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'Patient added successfully',
  PATIENT_UPDATED: 'Patient updated successfully',
  PATIENT_DELETED: 'Patient removed successfully'
} as const;