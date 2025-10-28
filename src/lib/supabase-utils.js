// Supabase utility functions for common operations
import { supabase } from './supabase';

/**
 * Handle Supabase errors consistently
 * @param {Object} error - The error object from Supabase
 * @param {string} defaultMessage - Default message if error is not specific
 * @returns {string} - User-friendly error message
 */
export const handleSupabaseError = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;

  // Handle specific error codes
  if (error.message) {
    // Auth errors
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists';
    }
    if (error.message.includes('Auth session missing')) {
      return 'Your session has expired. Please sign in again';
    }
    
    // Database errors
    if (error.message.includes('duplicate key value')) {
      return 'This record already exists';
    }
    if (error.message.includes('violates foreign key constraint')) {
      return 'Cannot complete this action due to related records';
    }
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return 'Database table not found. Please contact support';
    }
    
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      return 'Network error. Please check your connection and try again';
    }
    
    // Return the original error message if it's user-friendly
    return error.message;
  }

  return defaultMessage;
};

/**
 * Get the current user safely with error handling
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const getUserSafely = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return { user: null, error: handleSupabaseError(error) };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Exception getting user:', error);
    return { user: null, error: 'Failed to get user information' };
  }
};

/**
 * Sign in with retry logic for better reliability
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const signInWithRetry = async (email, password, maxRetries = 2) => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        lastError = error;
        
        // Don't retry on authentication errors (wrong credentials)
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          return { data: null, error: handleSupabaseError(error) };
        }
        
        // Wait before retrying on network errors
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      } else {
        return { data, error: null };
      }
    } catch (error) {
      lastError = error;
      
      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }
  
  return { data: null, error: handleSupabaseError(lastError, 'Sign in failed. Please try again') };
};

/**
 * Create a realtime subscription with automatic cleanup
 * @param {string} table - Table name to subscribe to
 * @param {Function} callback - Callback function for changes
 * @param {Object} filter - Optional filter object
 * @returns {Function} - Cleanup function to unsubscribe
 */
export const createRealtimeSubscription = (table, callback, filter = {}) => {
  let subscription = null;
  
  try {
    let query = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...filter
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          callback(payload);
        }
      );
    
    subscription = query.subscribe((status) => {
      console.log(`Subscription status for ${table}:`, status);
    });
    
    // Return cleanup function
    return () => {
      if (subscription) {
        console.log(`Unsubscribing from ${table}`);
        supabase.removeChannel(subscription);
      }
    };
  } catch (error) {
    console.error(`Error creating realtime subscription for ${table}:`, error);
    return () => {}; // Return empty cleanup function
  }
};

/**
 * Safely query a table with error handling
 * @param {string} table - Table name
 * @param {string} columns - Columns to select (default: *)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const queryTable = async (table, columns = '*') => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(columns);
    
    if (error) {
      return { data: [], error: handleSupabaseError(error) };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error: handleSupabaseError(error, 'Failed to query data') };
  }
};

/**
 * Safely insert data into a table
 * @param {string} table - Table name
 * @param {Object|Array} data - Data to insert
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const insertIntoTable = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
    
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, 'Failed to insert data') };
  }
};

/**
 * Safely update data in a table
 * @param {string} table - Table name
 * @param {Object} updates - Data to update
 * @param {Object} match - Match criteria
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateInTable = async (table, updates, match) => {
  try {
    let query = supabase
      .from(table)
      .update(updates);
    
    // Apply match criteria
    Object.entries(match).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.select();
    
    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, 'Failed to update data') };
  }
};

/**
 * Check if a table exists by trying to query it
 * @param {string} table - Table name
 * @returns {Promise<boolean>}
 */
export const tableExists = async (table) => {
  try {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  handleSupabaseError,
  getUserSafely,
  signInWithRetry,
  createRealtimeSubscription,
  queryTable,
  insertIntoTable,
  updateInTable,
  tableExists
};
