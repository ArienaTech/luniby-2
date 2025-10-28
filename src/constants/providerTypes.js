// Provider Type Constants
// Centralized definitions to avoid magic strings throughout the codebase

export const PROVIDER_TYPES = {
  VET_NURSE: 'vet_nurse',
  VETERINARIAN: 'veterinarian',
  GROOMER: 'groomer',
  TRAINER: 'trainer',
  PET_SITTER: 'pet_sitter',
  DOG_WALKER: 'dog_walker',
  OTHER: 'other'
};

// Provider type validation
export const isValidProviderType = (type) => {
  return Object.values(PROVIDER_TYPES).includes(type);
};

// Provider type display names
export const PROVIDER_TYPE_LABELS = {
  [PROVIDER_TYPES.VET_NURSE]: 'Veterinarian',
  [PROVIDER_TYPES.VETERINARIAN]: 'Veterinarian',
  [PROVIDER_TYPES.GROOMER]: 'Groomer',
  [PROVIDER_TYPES.TRAINER]: 'Trainer',
  [PROVIDER_TYPES.PET_SITTER]: 'Pet Sitter',
  [PROVIDER_TYPES.DOG_WALKER]: 'Dog Walker',
  [PROVIDER_TYPES.OTHER]: 'Other'
};

// Provider type icons
export const PROVIDER_TYPE_ICONS = {
  [PROVIDER_TYPES.VET_NURSE]: '👩‍⚕️',
  [PROVIDER_TYPES.VETERINARIAN]: '👨‍⚕️',
  [PROVIDER_TYPES.GROOMER]: '✂️',
  [PROVIDER_TYPES.TRAINER]: '🎾',
  [PROVIDER_TYPES.PET_SITTER]: '🏠',
  [PROVIDER_TYPES.DOG_WALKER]: '🚶‍♂️',
  [PROVIDER_TYPES.OTHER]: '🐾'
};