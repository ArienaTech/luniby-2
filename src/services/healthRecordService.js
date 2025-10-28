// Health records management service
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase-utils';

const healthRecordService = {
  // Get all health records for a pet
  async getPetHealthRecords(petId) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('record_date', { ascending: false });

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  },

  // Get a single health record
  async getHealthRecord(recordId) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Create a new health record
  async createHealthRecord(recordData) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert([recordData])
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

  // Update a health record
  async updateHealthRecord(recordId, updates) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .update(updates)
        .eq('id', recordId)
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

  // Delete a health record
  async deleteHealthRecord(recordId) {
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', recordId);

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Get health summary for a pet
  async getHealthSummary(petId) {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('record_date', { ascending: false })
        .limit(5);

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  }
};

export default healthRecordService;
