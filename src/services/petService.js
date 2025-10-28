// Pet management service
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase-utils';

const petService = {
  // Get all pets for a user
  async getUserPets(userId) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  },

  // Get a single pet by ID
  async getPet(petId) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Create a new pet
  async createPet(petData) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([petData])
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

  // Update a pet
  async updatePet(petId, updates) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
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

  // Delete a pet
  async deletePet(petId) {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error) };
    }
  },

  // Upload pet image
  async uploadPetImage(petId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}-${Date.now()}.${fileExt}`;
      const filePath = `${petId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, file);

      if (uploadError) {
        return { success: false, error: handleSupabaseError(uploadError), url: null };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), url: null };
    }
  }
};

export default petService;
