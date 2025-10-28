// Role-based utility functions
import { supabase } from '../lib/supabase';

// User roles constants
export const USER_ROLES = {
  PET_OWNER: 'pet_owner',
  VETERINARIAN: 'veterinarian',
  VET_NURSE: 'vet_nurse',
  GROOMER: 'groomer',
  TRAINER: 'trainer',
  BREEDER: 'breeder',
  NUTRITIONIST: 'nutritionist',
  PET_BUSINESS: 'pet_business',
  HOLISTIC_CARE: 'holistic_care',
  ADMIN: 'admin',
  SUPPORT: 'support'
};

// Get dashboard route based on user role
export const getDashboardRoute = (role) => {
  const roleRoutes = {
    [USER_ROLES.PET_OWNER]: '/pet-owner-dashboard',
    [USER_ROLES.VETERINARIAN]: '/veterinarian-portal',
    [USER_ROLES.VET_NURSE]: '/vet-nurse-dashboard',
    [USER_ROLES.GROOMER]: '/groomer-dashboard',
    [USER_ROLES.TRAINER]: '/trainer-dashboard',
    [USER_ROLES.BREEDER]: '/breeder-dashboard',
    [USER_ROLES.NUTRITIONIST]: '/nutritionist-dashboard',
    [USER_ROLES.PET_BUSINESS]: '/pet-business-dashboard',
    [USER_ROLES.HOLISTIC_CARE]: '/holistic-care-dashboard',
    [USER_ROLES.ADMIN]: '/admin',
    [USER_ROLES.SUPPORT]: '/support-dashboard'
  };

  return roleRoutes[role] || '/pet-owner-dashboard'; // Default to pet owner dashboard
};

// Ensure pet owner access
export const ensurePetOwnerAccess = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        success: false,
        error: 'Not authenticated',
        shouldRedirect: true,
        redirectTo: '/signin'
      };
    }

    // Get user role from metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role || USER_ROLES.PET_OWNER;

    // Allow access to pet owners and admins
    if (userRole === USER_ROLES.PET_OWNER || userRole === USER_ROLES.ADMIN) {
      return {
        success: true,
        user,
        role: userRole
      };
    }

    // User has a different role - redirect to their dashboard
    return {
      success: false,
      error: 'Access denied - wrong role',
      shouldRedirect: true,
      redirectTo: getDashboardRoute(userRole),
      role: userRole
    };
  } catch (error) {
    console.error('Error checking pet owner access:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify access',
      shouldRedirect: true,
      redirectTo: '/signin'
    };
  }
};

// Check if user has specific role
export const hasRole = async (requiredRole) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    
    // Admin has access to everything
    if (userRole === USER_ROLES.ADMIN) {
      return true;
    }

    return userRole === requiredRole;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Get user role
export const getUserRole = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return user.user_metadata?.role || user.app_metadata?.role || USER_ROLES.PET_OWNER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = async () => {
  return await hasRole(USER_ROLES.ADMIN);
};

// Check if user is provider (any type of service provider)
export const isProvider = async () => {
  const providerRoles = [
    USER_ROLES.VETERINARIAN,
    USER_ROLES.VET_NURSE,
    USER_ROLES.GROOMER,
    USER_ROLES.TRAINER,
    USER_ROLES.BREEDER,
    USER_ROLES.NUTRITIONIST,
    USER_ROLES.PET_BUSINESS,
    USER_ROLES.HOLISTIC_CARE
  ];

  try {
    const userRole = await getUserRole();
    return providerRoles.includes(userRole);
  } catch (error) {
    return false;
  }
};

export default {
  USER_ROLES,
  getDashboardRoute,
  ensurePetOwnerAccess,
  hasRole,
  getUserRole,
  isAdmin,
  isProvider
};
