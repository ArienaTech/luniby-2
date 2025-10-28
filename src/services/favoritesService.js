// Favorites service for managing user favorites
import { supabase } from '../lib/supabase';

const favoritesService = {
  // Get all favorites for a user
  async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  // Add a favorite
  async addFavorite(userId, listingId, listingType) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert([
          {
            user_id: userId,
            listing_id: listingId,
            listing_type: listingType,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data?.[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove a favorite
  async removeFavorite(userId, listingId, listingType) {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .eq('listing_type', listingType);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check if an item is favorited
  async isFavorited(userId, listingId, listingType) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .eq('listing_type', listingType)
        .limit(1);

      if (error) {
        return { success: false, error: error.message, isFavorited: false };
      }

      return { success: true, isFavorited: data && data.length > 0 };
    } catch (error) {
      return { success: false, error: error.message, isFavorited: false };
    }
  },

  // Get favorites count for a listing
  async getFavoritesCount(listingId, listingType) {
    try {
      const { count, error } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId)
        .eq('listing_type', listingType);

      if (error) {
        return { success: false, error: error.message, count: 0 };
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      return { success: false, error: error.message, count: 0 };
    }
  }
};

export default favoritesService;
