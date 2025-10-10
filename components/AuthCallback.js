import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { getDashboardRoute } from '../utils/roleUtils.js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // With detectSessionInUrl: true, Supabase parses URL and stores session on load.
        // We validate session and user before redirecting.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthCallback Debug - Session error:', sessionError);
          throw sessionError;
        }
        
        if (!session || !session.user) {
          console.log('AuthCallback Debug - No valid session found');
          navigate('/signin', { replace: true });
          return;
        }

        console.log('AuthCallback Debug - Valid session for user:', session.user.email);

        // Get user profile to validate and check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, id')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, other errors are actual problems
          console.error('AuthCallback Debug - Profile query error:', profileError);
          setError('Error loading user profile. Please try signing in again.');
          setTimeout(() => navigate('/signin', { replace: true }), 2000);
          return;
        }

        if (profile) {
          // Profile exists - validate role
          console.log('AuthCallback Debug - Profile found:', profile);
          console.log('AuthCallback Debug - Role:', profile.role);
          
          if (!profile.role) {
            console.log('AuthCallback Debug - Profile exists but no role assigned');
            setError('Account setup incomplete. Redirecting...');
            setTimeout(() => navigate('/signin', { replace: true }), 2000);
            return;
          }

          // Valid profile with role - redirect based on role
          console.log('AuthCallback Debug - Redirecting authenticated user based on role:', profile.role);
          
          if (profile.role === 'admin') {
            console.log('👑 AuthCallback Debug - ADMIN DETECTED - Redirecting to admin');
            navigate('/admin', { replace: true });
          } else if (profile.role === 'veterinarian') {
            console.log('🏥 AuthCallback Debug - VETERINARIAN DETECTED - Redirecting to veterinarian-portal');
            navigate('/veterinarian-portal', { replace: true });
          } else if (profile.role === 'vet_nurse') {
            console.log('👩‍⚕️ AuthCallback Debug - VET NURSE DETECTED - Redirecting to vet-nurse-dashboard');
            navigate('/vet-nurse-dashboard', { replace: true });
          } else {
            // Check if user is a provider and get provider type for more specific routing
            let effectiveRole = profile.role;
            if (profile.role === 'provider') {
              console.log('AuthCallback Debug - User is a provider, checking provider_type...');
              const { data: providerData, error: providerError } = await supabase
                .from('providers')
                .select('provider_type')
                .eq('user_id', session.user.id)
                .single();
              
              console.log('AuthCallback Debug - Provider query result:', { providerData, providerError });
              
              if (providerData?.provider_type === 'groomer') {
                effectiveRole = 'groomer';
                console.log('AuthCallback Debug - Setting effectiveRole to groomer');
              }
            }
            
            const dashboardRoute = getDashboardRoute(effectiveRole);
            console.log('👤 AuthCallback Debug - Redirecting user to:', dashboardRoute, 'effectiveRole:', effectiveRole);
            navigate(dashboardRoute, { replace: true });
          }
        } else {
          // No profile found - check if this is a new OAuth user
          console.log('AuthCallback Debug - No profile found for OAuth user:', session.user.email);
          
          // For OAuth users, we might need to create a profile or redirect to setup
          const accountAge = new Date() - new Date(session.user.created_at);
          const isNewAccount = accountAge < 5 * 60 * 1000; // Less than 5 minutes old
          
          if (isNewAccount) {
            console.log('AuthCallback Debug - New OAuth account detected, checking for provider record...');
            
            // Check if this user has a provider record to determine their role
            try {
              const { data: providerData } = await supabase
                .from('providers')
                .select('provider_type')
                .eq('user_id', session.user.id)
                .single();
              
              if (providerData?.provider_type) {
                console.log('AuthCallback Debug - Found provider type:', providerData.provider_type);
                
                let effectiveRole = 'provider';
                if (providerData.provider_type === 'groomer') {
                  effectiveRole = 'groomer';
                } else if (providerData.provider_type === 'trainer') {
                  effectiveRole = 'trainer';
                } else if (providerData.provider_type === 'breeder') {
                  effectiveRole = 'breeder';
                } else if (providerData.provider_type === 'nutritionist') {
                  effectiveRole = 'nutritionist';
                } else if (providerData.provider_type === 'pet_business') {
                  effectiveRole = 'pet_business';
                } else if (providerData.provider_type === 'holistic_care') {
                  effectiveRole = 'holistic_care';
                }
                
                const dashboardRoute = getDashboardRoute(effectiveRole);
                console.log('AuthCallback Debug - Redirecting OAuth provider to:', dashboardRoute);
                navigate(dashboardRoute, { replace: true });
              } else {
                console.log('AuthCallback Debug - No provider record found, defaulting to pet owner dashboard');
                navigate('/pet-owner-dashboard', { replace: true });
              }
            } catch (error) {
              console.log('AuthCallback Debug - Error checking provider record, defaulting to pet owner dashboard');
              navigate('/pet-owner-dashboard', { replace: true });
            }
          } else {
            // Older OAuth account without profile - needs investigation
            setError('Profile setup required. Please complete your registration.');
            setTimeout(() => navigate('/signup', { replace: true }), 2000);
            return;
          }
        }
      } catch (e) {
        setError('Authentication failed. Redirecting to sign in...');
        setTimeout(() => navigate('/signin', { replace: true }), 1500);
      }
    };

    completeAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5EB47C] mx-auto mb-4"></div>
        <p className="text-gray-600 font-montserrat">Completing sign-in...</p>
        {error && <p className="text-red-600 mt-2 font-montserrat text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default AuthCallback;