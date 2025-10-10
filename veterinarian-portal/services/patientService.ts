import { supabase } from '../../../src/lib/supabase';
import { getUserSafely } from '../../../src/lib/supabase-utils';
import type { Patient, PatientFormData, ApiResponse } from '../types';
import { ERROR_MESSAGES } from '../constants';

class PatientService {
  private tableName = 'patients';

  // Get current user ID
  private async getCurrentUserId(): Promise<string> {
    const user = await getUserSafely();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
    return user.id;
  }

  // Get all patients for current provider
  async getAll(): Promise<ApiResponse<Patient[]>> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  // Create new patient
  async create(patientData: PatientFormData): Promise<ApiResponse<Patient>> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...patientData,
          provider_id: userId
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  // Update patient
  async update(patientId: string, patientData: PatientFormData): Promise<ApiResponse<Patient>> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(patientData)
        .eq('id', patientId)
        .eq('provider_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  // Delete patient
  async delete(patientId: string): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', patientId)
        .eq('provider_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }
}

export const patientService = new PatientService();