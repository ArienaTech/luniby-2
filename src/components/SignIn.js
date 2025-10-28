import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { signInWithRetry, handleSupabaseError } from '../lib/supabase-utils.js';
import { getDashboardRoute } from '../utils/roleUtils.js';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error and pending message when user starts typing
    if (error) setError('');
    if (pendingMessage) setPendingMessage('');
  };

  // New feature: Anonymous sign-in (from Supabase GA Week updates)
  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setError('');
    setPendingMessage('');

    try {
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        setError(error.message);
        return;
      }

      // Navigate to marketplace for anonymous users
      navigate('/marketplace');
    } catch (err) {
      setError('Failed to sign in anonymously. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingMessage('');

    try {
      // Use enhanced sign-in with retry logic
      await signInWithRetry({
        email: formData.email,
        password: formData.password,
      });

      // Get user profile to check role and validate authentication
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('SignIn Debug - Error getting user:', userError);
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!currentUser) {
        console.log('SignIn Debug - No authenticated user found');
        setError('Authentication failed. Please try signing in again.');
        setLoading(false);
        return;
      }

      console.log('SignIn Debug - Authenticated user:', currentUser.email);

      // Try to get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email, id')
        .eq('id', currentUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, other errors are actual problems
        console.error('SignIn Debug - Profile query error:', profileError);
        setError('Error loading user profile. Please try again.');
        setLoading(false);
        return;
      }

      if (profile) {
        // Profile exists - validate role
        console.log('SignIn Debug - Profile found:', profile);
        console.log('SignIn Debug - Role:', profile.role);
        console.log('SignIn Debug - User email:', currentUser.email);
        
        // Check if user has trainer role or is a known trainer
        if (currentUser.email === 'tim-davis909@gmail.com' || profile?.role === 'trainer') {
          console.log('🔄 SignIn Debug - Trainer detected, redirecting to trainer dashboard');
          navigate('/trainer-dashboard');
          return;
        }
        
        if (!profile.role) {
          console.log('SignIn Debug - Profile exists but no role assigned');
          setError('Your account is not properly configured. Please contact support.');
          setLoading(false);
          return;
        }

        // Valid profile with role - redirect based on role
        console.log('SignIn Debug - Checking role for redirect:', profile.role);
        
        // Check for admin role first (highest priority)
        if (profile.role === 'admin') {
          console.log('👑 SignIn Debug - ADMIN DETECTED - Redirecting to admin dashboard');
          navigate('/admin');
          return;
        }
        
        // Check user_type from user metadata first (like navbar does)
        const userTypeFromMetadata = currentUser?.user_metadata?.user_type;
        console.log('SignIn Debug - User type from metadata:', userTypeFromMetadata);
        
        // Use user_type from metadata as the primary role source
        let effectiveRole = userTypeFromMetadata || profile.role;
        console.log('SignIn Debug - Effective role after metadata check:', effectiveRole);
        
        // Always check provider type to handle trainer accounts correctly
        console.log('SignIn Debug - Checking provider_type for user...');
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('provider_type')
          .eq('user_id', currentUser.id)
          .single();
        
        console.log('SignIn Debug - Provider query result:', { providerData, providerError });
        console.log('SignIn Debug - Provider type found:', providerData?.provider_type);
        
        // Override role based on provider_type for specific cases
        if (providerData?.provider_type === 'groomer') {
          effectiveRole = 'groomer';
          console.log('SignIn Debug - Setting effectiveRole to groomer based on provider_type');
        } else if (providerData?.provider_type === 'trainer') {
          effectiveRole = 'trainer';
          console.log('SignIn Debug - Setting effectiveRole to trainer based on provider_type');
        } else if (providerData?.provider_type === 'breeder') {
          effectiveRole = 'breeder';
          console.log('SignIn Debug - Setting effectiveRole to breeder based on provider_type');
        } else if (providerData?.provider_type === 'nutritionist') {
          effectiveRole = 'nutritionist';
          console.log('SignIn Debug - Setting effectiveRole to nutritionist based on provider_type');
        } else if (providerData?.provider_type === 'pet_business') {
          effectiveRole = 'pet_business';
          console.log('SignIn Debug - Setting effectiveRole to pet_business based on provider_type');
        } else if (providerData?.provider_type === 'holistic_care') {
          effectiveRole = 'holistic_care';
          console.log('SignIn Debug - Setting effectiveRole to holistic_care based on provider_type');
        } else if (providerData?.provider_type) {
          console.log('SignIn Debug - Found provider_type but no specific mapping:', providerData.provider_type);
          // For other provider types, keep the original profile role or set to provider
          if (profile.role === 'pet_owner' || !profile.role) {
            effectiveRole = 'provider';
            console.log('SignIn Debug - Upgrading pet_owner to provider based on provider_type');
          }
        } else {
          console.log('SignIn Debug - No provider record found, using profile role:', profile.role);
        }
        
        // Use getDashboardRoute for consistent role-based routing
        const dashboardRoute = getDashboardRoute(effectiveRole);
        
        console.log('SignIn Debug - Final routing decision:');
        console.log('  - Original profile role:', profile.role);
        console.log('  - Provider type:', providerData?.provider_type);
        console.log('  - Effective role:', effectiveRole);
        console.log('  - Dashboard route:', dashboardRoute);
        console.log('  - User email:', currentUser.email);
        
        // Special handling for veterinarian role (redirect to veterinarian-portal instead of dashboard)
        if (effectiveRole === 'veterinarian') {
          console.log('🏥 SignIn Debug - VETERINARIAN DETECTED - Redirecting to /veterinarian-portal');
          navigate('/veterinarian-portal');
        } else {
          console.log(`✅ SignIn Debug - Redirecting user '${currentUser.email}' with effectiveRole '${effectiveRole}' to ${dashboardRoute}`);
          navigate(dashboardRoute);
        }
      } else {
        // No profile found - check user metadata first, then provider record
        console.log('SignIn Debug - No profile found for user:', currentUser.email);
        
        // Check user_type from user metadata first (like navbar does)
        const userTypeFromMetadata = currentUser?.user_metadata?.user_type;
        console.log('SignIn Debug - User type from metadata:', userTypeFromMetadata);
        
        if (userTypeFromMetadata) {
          // User has role in metadata, route them to appropriate dashboard
          const dashboardRoute = getDashboardRoute(userTypeFromMetadata);
          console.log('SignIn Debug - Routing based on metadata to:', dashboardRoute);
          navigate(dashboardRoute);
          return;
        }
        
        // Check if this user has a provider record to determine their role
        try {
          const { data: providerData, error: providerError } = await supabase
            .from('providers')
            .select('provider_type')
            .eq('user_id', currentUser.id)
            .single();
          
          if (providerData?.provider_type) {
            console.log('SignIn Debug - Found provider type:', providerData.provider_type);
            
            let effectiveRole = 'pet_owner'; // Default fallback
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
            console.log('SignIn Debug - Redirecting provider to:', dashboardRoute);
            navigate(dashboardRoute);
          } else {
            console.log('SignIn Debug - No provider record found, defaulting to pet owner dashboard');
            navigate('/pet-owner-dashboard');
          }
        } catch (error) {
          console.log('SignIn Debug - Error checking provider record, defaulting to pet owner dashboard');
          navigate('/pet-owner-dashboard');
        }
      }

    } catch (error) {
      const supabaseError = handleSupabaseError(error, 'sign in');
      setError(supabaseError.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setError('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 font-montserrat leading-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-montserrat">
          Or{' '}
          <Link
            to="/signup"
            className="font-medium text-[#5EB47C] hover:text-[#4A9A64] transition-colors"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-montserrat text-sm">
                {error}
              </div>
            )}

            {pendingMessage && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl font-montserrat text-sm whitespace-pre-line">
                {pendingMessage}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-montserrat">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-montserrat">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#5EB47C] focus:ring-[#5EB47C] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-montserrat">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-[#5EB47C] hover:text-[#4A9A64] transition-colors font-montserrat"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#5EB47C] hover:bg-[#4A9A64] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EB47C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-montserrat"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-montserrat">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EB47C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-montserrat"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>

                {/* New Anonymous Sign-in Feature */}
                <button
                  type="button"
                  onClick={handleAnonymousSignIn}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EB47C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-montserrat"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Browse as Guest
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-montserrat">
              Are you a pet care provider?{' '}
              <Link
                to="/provider-signup"
                className="font-medium text-[#5EB47C] hover:text-[#4A9A64] transition-colors"
              >
                Join as a Provider
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;