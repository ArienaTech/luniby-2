// Essential Types for Veterinarian Portal

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  address?: string;
  provider_type: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  provider_id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  owner_name: string;
  owner_phone?: string;
  owner_email?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalBookings: number;
  totalProcedures: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeServices: number;
  completedCases: number;
  pendingCases: number;
}

// Form Types
export interface PatientFormData {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  owner_name: string;
  owner_phone?: string;
  owner_email?: string;
  medical_history?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}