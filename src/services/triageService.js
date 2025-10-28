// Triage management service
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase-utils';

const triageService = {
  // Create a new triage case
  async createTriage(triageData) {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .insert([{
          ...triageData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
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

  // Get triage case by ID
  async getTriage(triageId) {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .select('*')
        .eq('id', triageId)
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Get user's triage cases
  async getUserTriages(userId) {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
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

  // Update triage status
  async updateTriageStatus(triageId, status, notes = '') {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', triageId)
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

export default triageService;
