// Security utilities for role-based access control
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authManager from './auth-manager';

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRole) => {
  return function ProtectedComponent(props) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
      const checkAuthorization = async () => {
        try {
          const user = authManager.getUser();
          
          if (!user) {
            setAuthorized(false);
            setLoading(false);
            return;
          }

          // Get user role from user metadata
          const role = user.user_metadata?.role || user.role;
          setUserRole(role);

          // Check if user has required role
          if (role === requiredRole || role === 'admin') {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
        } catch (error) {
          console.error('Authorization check failed:', error);
          setAuthorized(false);
        } finally {
          setLoading(false);
        }
      };

      checkAuthorization();

      // Subscribe to auth changes
      const unsubscribe = authManager.subscribe(() => {
        checkAuthorization();
      });

      return () => unsubscribe();
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying access...</p>
          </div>
        </div>
      );
    }

    if (!authorized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-sm text-gray-500 mb-4">
                You don't have permission to access this page. Required role: {requiredRole}
                {userRole && ` (Your role: ${userRole})`}
              </p>
              <a
                href="/"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#5EB47C] border border-transparent rounded-md hover:bg-[#4A9A64]"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Hook for checking permissions
export const usePermission = (requiredRole) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      const user = authManager.getUser();
      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      const role = user.user_metadata?.role || user.role;
      setHasPermission(role === requiredRole || role === 'admin');
      setLoading(false);
    };

    checkPermission();

    const unsubscribe = authManager.subscribe(() => {
      checkPermission();
    });

    return () => unsubscribe();
  }, [requiredRole]);

  return { hasPermission, loading };
};

export default { withRoleProtection, usePermission };
