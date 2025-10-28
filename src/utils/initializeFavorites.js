// Initialize favorites system
import { supabase } from '../lib/supabase';

export const initializeFavorites = async () => {
  try {
    // Check if the user_favorites table exists by trying to query it
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist, return that setup is needed
      if (error.message.includes('relation "user_favorites" does not exist')) {
        console.warn('⚠️ user_favorites table does not exist');
        return {
          success: false,
          needsSetup: true,
          message: 'Favorites table needs to be created in database'
        };
      }
      
      // Other errors
      console.error('Error checking favorites table:', error);
      return {
        success: false,
        needsSetup: false,
        error: error.message
      };
    }

    // Table exists and is accessible
    return {
      success: true,
      needsSetup: false,
      message: 'Favorites system ready'
    };
  } catch (error) {
    console.error('Error initializing favorites:', error);
    return {
      success: false,
      needsSetup: false,
      error: error.message
    };
  }
};

export default initializeFavorites;
