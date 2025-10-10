import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User, Profile, Patient, DashboardStats } from '../types';

// Simplified State Interface
interface VeterinarianState {
  user: User | null;
  profile: Profile | null;
  patients: Patient[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  activeSection: string;
}

// Context Interface
interface VeterinarianContextType {
  state: VeterinarianState;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  removePatient: (patientId: string) => void;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveSection: (section: string) => void;
}

// Create Context
const VeterinarianContext = createContext<VeterinarianContextType | undefined>(undefined);

// Initial State
const initialState: VeterinarianState = {
  user: null,
  profile: null,
  patients: [],
  stats: {
    totalPatients: 0,
    totalBookings: 0,
    totalProcedures: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeServices: 0,
    completedCases: 0,
    pendingCases: 0
  },
  loading: false,
  error: null,
  activeSection: 'overview'
};

// Provider Component
export const VeterinarianProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VeterinarianState>(initialState);

  // Simplified state setters
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  const setProfile = useCallback((profile: Profile | null) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const setPatients = useCallback((patients: Patient[]) => {
    setState(prev => ({ ...prev, patients }));
  }, []);

  const addPatient = useCallback((patient: Patient) => {
    setState(prev => ({ ...prev, patients: [...prev.patients, patient] }));
  }, []);

  const updatePatient = useCallback((patient: Patient) => {
    setState(prev => ({
      ...prev,
      patients: prev.patients.map(p => p.id === patient.id ? patient : p)
    }));
  }, []);

  const removePatient = useCallback((patientId: string) => {
    setState(prev => ({
      ...prev,
      patients: prev.patients.filter(p => p.id !== patientId)
    }));
  }, []);

  const setStats = useCallback((stats: DashboardStats) => {
    setState(prev => ({ ...prev, stats }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setActiveSection = useCallback((activeSection: string) => {
    setState(prev => ({ ...prev, activeSection }));
  }, []);

  const value: VeterinarianContextType = {
    state,
    setUser,
    setProfile,
    setPatients,
    addPatient,
    updatePatient,
    removePatient,
    setStats,
    setLoading,
    setError,
    setActiveSection
  };

  return (
    <VeterinarianContext.Provider value={value}>
      {children}
    </VeterinarianContext.Provider>
  );
};

// Hook to use context
export const useVeterinarian = (): VeterinarianContextType => {
  const context = useContext(VeterinarianContext);
  if (!context) {
    throw new Error('useVeterinarian must be used within VeterinarianProvider');
  }
  return context;
};