// Medical history service
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase-utils';

const medicalHistoryService = {
  // Get medical history for a pet
  async getMedicalHistory(petId) {
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  },

  // Add medical history entry
  async addMedicalHistory(historyData) {
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .insert([historyData])
        .select()
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Update medical history entry
  async updateMedicalHistory(historyId, updates) {
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .update(updates)
        .eq('id', historyId)
        .select()
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Delete medical history entry
  async deleteMedicalHistory(historyId) {
    try {
      const { error } = await supabase
        .from('medical_history')
        .delete()
        .eq('id', historyId);

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  }
};

export default medicalHistoryService;
