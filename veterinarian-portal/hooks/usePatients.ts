import { useCallback, useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import type { Patient, PatientFormData } from '../types';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patients from API
  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getAll();
      
      if (response.success && response.data) {
        setPatients(response.data);
      } else {
        throw new Error(response.error || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load patients on mount
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Create new patient
  const createPatient = useCallback(async (patientData: PatientFormData) => {
    if (!patientData.name || !patientData.species || !patientData.owner_name) {
      return { success: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    try {
      setLoading(true);
      const response = await patientService.create(patientData);
      
      if (response.success && response.data) {
        setPatients(prev => [...prev, response.data!]);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR;
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing patient
  const editPatient = useCallback(async (patientId: string, patientData: PatientFormData) => {
    if (!patientData.name || !patientData.species || !patientData.owner_name) {
      return { success: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    try {
      setLoading(true);
      const response = await patientService.update(patientId, patientData);
      
      if (response.success && response.data) {
        setPatients(prev => prev.map(p => p.id === patientId ? response.data! : p));
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR;
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete patient
  const deletePatient = useCallback(async (patientId: string, patientName: string) => {
    try {
      setLoading(true);
      const response = await patientService.delete(patientId);
      
      if (response.success) {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        return { success: true };
      } else {
        throw new Error(response.error || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR;
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patients,
    loading,
    error,
    loadPatients,
    createPatient,
    editPatient,
    deletePatient
  };
};