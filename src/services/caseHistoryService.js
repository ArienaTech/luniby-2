// Case history management service
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase-utils';

const caseHistoryService = {
  // Get case history for a pet
  async getPetCaseHistory(petId) {
    try {
      const { data, error } = await supabase
        .from('case_history')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  },

  // Get case history for a user
  async getUserCaseHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('case_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  },

  // Get a single case
  async getCase(caseId) {
    try {
      const { data, error } = await supabase
        .from('case_history')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Create a new case
  async createCase(caseData) {
    try {
      const { data, error } = await supabase
        .from('case_history')
        .insert([caseData])
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

  // Update a case
  async updateCase(caseId, updates) {
    try {
      const { data, error } = await supabase
        .from('case_history')
        .update(updates)
        .eq('id', caseId)
        .select()
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  }
};

export default caseHistoryService;
