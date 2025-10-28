import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { handleSupabaseError } from '../lib/supabase-utils.js';
import { emailService } from '../lib/email-service.js';
import { getDashboardRoute } from '../utils/roleUtils.js';

const ProviderSignUp = () => {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Business Info
    providerType: '',
    businessName: '',
    licenseNumber: '',
    address: '',
    city: '',
    country: 'Australia',
    
    // Terms
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  // Dropdown states
  const [providerTypeOpen, setProviderTypeOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  
  // Refs for dropdowns
  const providerTypeRef = useRef(null);
  const countryRef = useRef(null);

  const providerTypes = [
    { display: 'Veterinarian', value: 'veterinarian', description: 'Licensed veterinary doctor providing medical services' },
    { display: 'Vet Nurse', value: 'vet_nurse', description: 'Qualified veterinary nurse providing care services' },
    { display: 'Groomers', value: 'groomer', description: 'Pet grooming and hygiene services' },
    { display: 'Trainers', value: 'trainer', description: 'Pet training and behavior services' },
    { display: 'Breeders', value: 'breeder', description: 'Pet breeding services' },
    { display: 'Nutritionists', value: 'nutritionist', description: 'Pet nutrition and dietary services' },
    { display: 'Pet Business', value: 'pet_business', description: 'Other pet-related business services' },
    { display: 'Holistic Care', value: 'holistic_care', description: 'Alternative and holistic pet care' }
  ];

  const countries = ['Australia', 'New Zealand'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    if (!formData.providerType) {
      setError('Please select a provider type.');
      return false;
    }
    if (formData.providerType === 'veterinarian') {
      if (!formData.businessName.trim()) {
        setError('Clinic/Practice name is required for veterinarians.');
        return false;
      }
      if (!formData.licenseNumber.trim()) {
        setError('Veterinary license number is required for veterinarians.');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Clinic address is required for veterinarians.');
        return false;
      }
    }
    if (!formData.city.trim()) {
      setError('City is required.');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    return true;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (providerTypeRef.current && !providerTypeRef.current.contains(event.target)) {
        setProviderTypeOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            user_type: formData.providerType,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            business_name: formData.businessName
          }
        }
      });

      if (authError) {
        const supabaseError = handleSupabaseError(authError, 'provider sign up');
        setError(supabaseError.message);
        setLoading(false);
        return;
      }

      // Create provider listing after successful signup
      if (data.user) {
        try {
          // Wait for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Debug: Log the form data before insertion
          console.log('Provider signup data:', {
            providerType: formData.providerType,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email
          });

          const providerInsertData = {
            id: data.user.id,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            provider_type: formData.providerType,
            business_name: formData.providerType === 'veterinarian' ? formData.businessName : null,
            license_number: formData.providerType === 'veterinarian' ? formData.licenseNumber : null,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            bio: `${providerTypes.find(type => type.value === formData.providerType)?.display || formData.providerType} professional providing quality services.`,
            offers_services: true,
            offers_products: false,
            service_types: [providerTypes.find(type => type.value === formData.providerType)?.display || formData.providerType],
            verified: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          

          // Provider signup successful - profile created
          console.log('Provider signup successful - profile created with role: provider');
          
          {
            
            
            
            
            // Create profile manually since trigger is disabled
            const location = [formData.address, formData.city, formData.country]
              .filter(Boolean)
              .join(', ');
            
            console.log('🔧 Creating profile with role:', formData.providerType);
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: formData.email,
                full_name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                location: location,
                organization: formData.businessName,
                role: formData.providerType  // Use providerType directly as role
              })
              .select();
            
            if (profileError) {
              console.error('❌ Profile creation error:', profileError);
            } else {
              console.log('✅ Profile created successfully with role:', formData.providerType);
              console.log('📋 Profile data:', profileData);
            }
            
            // Send admin notification for new provider application
            
            try {
              await emailService.sendAdminProviderNotification({
                provider_name: `${formData.firstName} ${formData.lastName}`,
                provider_email: formData.email,
                phone: formData.phone,
                provider_type: providerTypes.find(type => type.value === formData.providerType)?.display || formData.providerType,
                city: formData.city,
                country: formData.country,
                address: formData.address,
                bio: `${providerTypes.find(type => type.value === formData.providerType)?.display || formData.providerType} professional providing quality services.`,
                created_at: new Date().toISOString()
              });
              
            } catch (emailError) {
              
              
              // Don't fail signup for this - provider was created successfully
            }
          }
        } catch (error) {
          
          // Don't fail signup for this
        }
      }

                // Wait for profile creation, then redirect to appropriate dashboard
      console.log('✅ ProviderSignUp - Signup completed successfully');
      console.log('📋 Provider type:', formData.providerType);
      
      // Wait a moment for the profile to be created, then redirect
      setTimeout(async () => {
        try {
          // Verify the profile was created with correct role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .single();

          console.log('🔍 ProviderSignUp - Profile check:', profile);
          
          // Determine redirect based on provider type from form
          let dashboardRoute = '/trainer-dashboard'; // Default to trainer for now
          
          if (formData.providerType === 'trainer') {
            dashboardRoute = '/trainer-dashboard';
            console.log('🎯 ProviderSignUp - Trainer signup, redirecting to trainer dashboard');
          } else if (formData.providerType === 'groomer') {
            dashboardRoute = '/groomer-dashboard';
          } else if (formData.providerType === 'breeder') {
            dashboardRoute = '/breeder-dashboard';
          } else if (formData.providerType === 'nutritionist') {
            dashboardRoute = '/nutritionist-dashboard';
          } else if (formData.providerType === 'pet_business') {
            dashboardRoute = '/pet-business-dashboard';
          } else if (formData.providerType === 'holistic_care') {
            dashboardRoute = '/holistic-care-dashboard';
          } else if (formData.providerType === 'veterinarian') {
            dashboardRoute = '/veterinarian-portal';
          } else if (formData.providerType === 'vet_nurse') {
            dashboardRoute = '/vet-nurse-dashboard';
          }
          
          console.log('🚀 ProviderSignUp - Redirecting to:', dashboardRoute);
          navigate(dashboardRoute);
          
        } catch (error) {
          console.error('Error checking profile:', error);
          // Fallback redirect based on form data
          if (formData.providerType === 'trainer') {
            navigate('/trainer-dashboard');
          } else {
            navigate('/pet-owner-dashboard');
          }
        }
      }, 1500); // Give time for profile creation
      
      setLoading(false);

    } catch (error) {
      
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 font-montserrat leading-tight">
          Apply to Join as a Provider
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-montserrat">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-medium text-[#5EB47C] hover:text-primary-500 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-200">
          {error && (
            <div className={`mb-6 border px-4 py-3 rounded-xl font-montserrat text-sm ${
              error.includes('successfully') 
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 font-montserrat">
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="First name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 font-montserrat">
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-montserrat">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 font-montserrat">
                Phone number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                placeholder="+61 4XX XXX XXX"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-montserrat">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="Create a password"
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
              <p className="mt-1 text-xs text-gray-500 font-montserrat">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 font-montserrat">
                Confirm password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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

            <div ref={providerTypeRef}>
              <label htmlFor="providerType" className="block text-sm font-medium text-gray-700 font-montserrat">
                Provider type *
              </label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setProviderTypeOpen(!providerTypeOpen)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                >
                  <span>
                    {formData.providerType 
                      ? providerTypes.find(type => type.value === formData.providerType)?.display || formData.providerType
                      : 'Select provider type'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${providerTypeOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {providerTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, providerType: ''});
                        setProviderTypeOpen(false);
                      }}
                      className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                        !formData.providerType ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                      }`}
                    >
                      Select provider type
                    </button>
                    {providerTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, providerType: type.value});
                          setProviderTypeOpen(false);
                        }}
                        className={`w-full px-3 py-3 text-left hover:bg-gray-50 border-t border-gray-200 font-montserrat ${
                          formData.providerType === type.value ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{type.display}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conditional fields for veterinarians */}
            {formData.providerType === 'veterinarian' && (
              <>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 font-montserrat">
                    Clinic/Practice Name *
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                    placeholder="Your clinic or practice name"
                  />
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 font-montserrat">
                    Veterinary License Number *
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                    placeholder="Your veterinary license number"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 font-montserrat">
                {formData.providerType === 'veterinarian' ? 'Clinic Address *' : 'Address'}
              </label>
                              <input
                  id="address"
                  name="address"
                  type="text"
                  required={formData.providerType === 'veterinarian'}
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder={formData.providerType === 'veterinarian' ? 'Your clinic address' : 'Your business address'}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 font-montserrat">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  placeholder="City"
                />
              </div>

              <div ref={countryRef}>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 font-montserrat">
                  Country *
                </label>
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setCountryOpen(!countryOpen)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  >
                    <span>
                      {formData.country || 'Select country'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${countryOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {countryOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {countries.map((country, index) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, country: country});
                            setCountryOpen(false);
                          }}
                          className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                            formData.country === country ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                          } ${index > 0 ? 'border-t border-gray-200' : ''}`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-[#5EB47C] focus:ring-[#5EB47C] border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900 font-montserrat">
                I agree to the{' '}
                <button type="button" className="text-[#5EB47C] hover:text-primary-500 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-[#5EB47C] hover:text-primary-500 underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#5EB47C] hover:bg-[#4A9A64] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EB47C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-montserrat"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting application...
                  </div>
                ) : (
                  'Submit Provider Application'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-montserrat">
              Looking for pet care instead?{' '}
              <Link
                to="/signup"
                className="font-medium text-[#5EB47C] hover:text-primary-500 transition-colors"
              >
                Sign up as a Customer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignUp;