// Centralized authentication manager
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️ Supabase credentials not configured');
}

// Authentication state management
class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.listeners = new Set();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized || !supabase) return;

    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth initialization error:', error);
        return;
      }

      this.session = session;
      this.user = session?.user || null;
      this.initialized = true;

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session;
        this.user = session?.user || null;
        this.notifyListeners();
      });

      console.log('✅ Auth manager initialized');
    } catch (error) {
      console.error('Auth manager initialization failed:', error);
    }
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of auth state change
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.user, this.session);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get current session
  getSession() {
    return this.session;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.session && !!this.user;
  }

  // Sign in
  async signIn(email, password) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  // Sign up
  async signUp(email, password, metadata = {}) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  }

  // Sign out
  async signOut() {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.user = null;
    this.session = null;
    this.notifyListeners();
  }

  // Get Supabase client
  getClient() {
    return supabase;
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Initialize on import
if (typeof window !== 'undefined') {
  authManager.initialize();
  window.authManager = authManager; // Make available globally for debugging
}

// Subscribe to auth state changes (for backward compatibility)
export const subscribeToAuth = (callback) => {
  return authManager.subscribe((user, session) => {
    // Determine event type
    let event = 'INITIAL_SESSION';
    if (session && user) {
      event = 'SIGNED_IN';
    } else if (!session && !user) {
      event = 'SIGNED_OUT';
    }
    
    callback(event, session);
  });
};

export default authManager;
export { supabase };
