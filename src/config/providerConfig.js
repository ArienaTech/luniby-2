// Centralized Provider Configuration
// All provider-specific settings, navigation, and features

import { PROVIDER_TYPES } from '../constants/providerTypes';

// Navigation icons as reusable components
const NavigationIcons = {
  overview: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
    </svg>
  ),
  marketplace: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  schedule: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  messages: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  triage: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  patients: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  procedures: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  cases: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  pets: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  services: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01m0 4h.01m4-8h.01M13 12h.01m0 4h.01m4-8h.01m0 4h.01m0 4h.01" />
    </svg>
  ),
  gallery: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  billing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  inventory: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 3l4 2 4-2-4-2zM9 1v6" />
    </svg>
  ),
  appointments: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
};

// Base navigation sections shared by all providers
const baseNavigationSections = [
  { id: 'overview', name: 'Overview', icon: NavigationIcons.overview },
  { id: 'marketplace', name: 'Marketplace', icon: NavigationIcons.marketplace },
  { id: 'schedule', name: 'Bookings', icon: NavigationIcons.schedule },
  { id: 'messages', name: 'Messages', icon: NavigationIcons.messages },
  { id: 'analytics', name: 'Analytics', icon: NavigationIcons.analytics },
  { id: 'profile', name: 'Profile', icon: NavigationIcons.profile }
];

// Provider-specific configuration
export const PROVIDER_CONFIG = {
  [PROVIDER_TYPES.VET_NURSE]: {
    labels: {
      title: 'My Dashboard',
      businessType: 'Vet Nurse',
      serviceLabel: 'Care Services',
      specialtyLabel: 'Qualifications',
      dashboardTitle: 'Vet Nurse'
    },
    navigation: [
      ...baseNavigationSections.slice(0, 2), // Overview, Marketplace
      { id: 'cases', name: 'Cases', icon: NavigationIcons.cases },
      ...baseNavigationSections.slice(2) // Bookings, Messages, Analytics, Profile
    ],
    features: [
      'case_management',
      'triage_review',
      'soap_notes',
      'consultation_booking',
      'escalation',
      'metrics_tracking'
    ],
    defaultBio: 'Professional veterinary nurse providing quality care for your pets. Experienced in various treatments and dedicated to animal welfare.',
    quickActions: [
      {
        id: 'emergency_cases',
        label: 'Emergency Cases',
        icon: '🚨',
        action: 'cases',
        color: 'red',
        filter: 'emergency'
      },
      {
        id: 'pending_assessment',
        label: 'Pending Assessment',
        icon: '⏳',
        action: 'cases',
        color: 'blue',
        filter: 'pending'
      },
      {
        id: 'my_cases',
        label: 'My Cases',
        icon: '👤',
        action: 'cases',
        color: 'purple',
        filter: 'assigned'
      }
    ]
  },
  
  [PROVIDER_TYPES.VETERINARIAN]: {
    labels: {
      title: 'Veterinarian Dashboard',
      businessType: 'Veterinary Clinic',
      serviceLabel: 'Medical Services',
      specialtyLabel: 'Specializations',
      dashboardTitle: 'Vet'
    },
    navigation: [
      ...baseNavigationSections.slice(0, 2), // Overview, Marketplace
      { id: 'patients', name: 'Patients', icon: NavigationIcons.patients },
      { id: 'procedures', name: 'Procedures', icon: NavigationIcons.procedures },
      ...baseNavigationSections.slice(2) // Bookings, Messages, Analytics, Profile
    ],
    features: [
      'patient_management',
      'procedure_scheduling',
      'medical_records',
      'prescription_management',
      'clinic_management',
      'surgery_scheduling'
    ],
    defaultBio: 'Licensed veterinarian providing comprehensive medical care for pets. Specializing in diagnostics, treatment, and preventive care.',
    quickActions: [
      {
        id: 'new_patient',
        label: 'New Patient',
        icon: '🐕',
        action: 'patients',
        color: 'blue'
      },
      {
        id: 'schedule_surgery',
        label: 'Schedule Surgery',
        icon: '🏥',
        action: 'procedures',
        color: 'orange'
      },
      {
        id: 'emergency_cases',
        label: 'Emergency Cases',
        icon: '🚨',
        action: 'patients',
        color: 'red',
        filter: 'emergency'
      }
    ]
  },

  // Enhanced configuration for groomers
  [PROVIDER_TYPES.GROOMER]: {
    labels: {
      title: 'My Dashboard',
      sidebarTitle: 'Groomer',
      businessType: 'Pet Grooming',
      serviceLabel: 'Grooming Services',
      specialtyLabel: 'Specializations',
      dashboardTitle: 'Groomer'
    },
    navigation: [
      { id: 'overview', name: 'Overview', icon: NavigationIcons.overview },
      { id: 'marketplace', name: 'Marketplace', icon: NavigationIcons.marketplace },
      { id: 'bookings', name: 'My Bookings', icon: NavigationIcons.schedule },
      { id: 'services', name: 'My Services', icon: NavigationIcons.services },
      { id: 'gallery', name: 'Photo Gallery', icon: NavigationIcons.gallery },
      { id: 'messages', name: 'Messages', icon: NavigationIcons.messages },
      { id: 'earnings', name: 'Earnings', icon: NavigationIcons.analytics },
      { id: 'profile', name: 'Profile', icon: NavigationIcons.profile }
    ],
    features: [
      'appointment_booking',
      'pet_profile_management',
      'grooming_history',
      'photo_gallery',
      'service_catalog',
      'pricing_management',
      'inventory_tracking',
      'client_communication',
      'payment_processing',
      'analytics_reporting',
      'mobile_grooming_support'
    ],
    defaultBio: 'Professional pet groomer providing quality grooming services for all breeds. Experienced in breed-specific cuts and dedicated to pet comfort and style.',
    quickActions: [
      {
        id: 'next_appointment',
        label: 'Next Appointment',
        icon: '⏰',
        action: 'appointments',
        color: 'blue'
      },
      {
        id: 'add_pet',
        label: 'New Pet Profile',
        icon: '🐕',
        action: 'pets',
        color: 'green'
      },
      {
        id: 'upload_photos',
        label: 'Upload Photos',
        icon: '📸',
        action: 'gallery',
        color: 'purple'
      },
      {
        id: 'check_supplies',
        label: 'Check Supplies',
        icon: '📦',
        action: 'inventory',
        color: 'orange'
      }
    ]
  },

  [PROVIDER_TYPES.TRAINER]: {
    labels: {
      title: 'Trainer Dashboard',
      businessType: 'Pet Training',
      serviceLabel: 'Training Services',
      specialtyLabel: 'Specializations',
      dashboardTitle: 'Trainer'
    },
    navigation: baseNavigationSections,
    features: ['training_programs', 'client_management', 'scheduling'],
    defaultBio: 'Certified pet trainer specializing in behavior modification and obedience training.',
    quickActions: []
  }
};

// Helper functions
export const getProviderConfig = (providerType) => {
  return PROVIDER_CONFIG[providerType] || PROVIDER_CONFIG[PROVIDER_TYPES.VET_NURSE];
};

export const getProviderLabels = (providerType) => {
  return getProviderConfig(providerType).labels;
};

export const getProviderNavigation = (providerType) => {
  return getProviderConfig(providerType).navigation;
};

export const getProviderFeatures = (providerType) => {
  return getProviderConfig(providerType).features;
};

export const hasFeature = (providerType, feature) => {
  return getProviderFeatures(providerType).includes(feature);
};

export const getProviderQuickActions = (providerType) => {
  return getProviderConfig(providerType).quickActions || [];
};