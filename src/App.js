import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as Sentry from "@sentry/react";
import './lib/sentry'; // Initialize Sentry
import './lib/auth-manager'; // Initialize centralized auth manager
import './lib/connection-monitor'; // Initialize connection monitor
import { NotificationProvider } from './contexts/NotificationContext';
import { FavoritesProvider } from './components/FavoriteButton';


// Essential components (loaded immediately)
import Navbar from './components/Navbar';
import VetDashboard from './components/VetDashboard';


// Enterprise Libraries
import { withRoleProtection } from './lib/security';

// Lazy loaded components for better performance
const LiveMarketplace = React.lazy(() => import('./components/LiveMarketplace'));
const ProviderDetail = React.lazy(() => import('./components/ProviderDetail'));
const ProductDetail = React.lazy(() => import('./components/ProductDetail'));
const SignIn = React.lazy(() => import('./components/SignIn'));
const SignUp = React.lazy(() => import('./components/SignUp'));
const ProviderSignUp = React.lazy(() => import('./components/ProviderSignUp'));
const SimpleProviderSignUp = React.lazy(() => import('./components/SimpleProviderSignUp'));
const LuniTriage = React.lazy(() => import('./components/LuniTriage'));
const TriageStatus = React.lazy(() => import('./components/TriageStatus'));
const Disclaimer = React.lazy(() => import('./components/Disclaimer'));

// New: OAuth callback handler
const AuthCallback = React.lazy(() => import('./components/AuthCallback'));

// Enterprise Components - lazy loaded
const DataPrivacy = React.lazy(() => import('./components/DataPrivacy'));
const PetOwnerDashboard = React.lazy(() => import('./components/PetOwnerDashboard'));
const PricingPage = React.lazy(() => import('./components/PricingPage'));
const ClinicPage = React.lazy(() => import('./components/ClinicPage'));
const VetSchoolsPage = React.lazy(() => import('./components/VetSchoolsPage'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));
const InvestorsPage = React.lazy(() => import('./components/InvestorsPage'));
const PremiumOnboarding = React.lazy(() => import('./components/PremiumOnboarding'));
const APIDocumentation = React.lazy(() => import('./components/APIDocumentation'));

const GroomerDashboard = React.lazy(() => import('./components/GroomerDashboard'));
const TrainerDashboard = React.lazy(() => import('./components/TrainerDashboard'));
const BreederDashboard = React.lazy(() => import('./components/BreederDashboard'));
const NutritionistDashboard = React.lazy(() => import('./components/NutritionistDashboard'));
const PetBusinessDashboard = React.lazy(() => import('./components/PetBusinessDashboard'));
const HolisticCareDashboard = React.lazy(() => import('./components/HolisticCareDashboard'));
const FavoritesPage = React.lazy(() => import('./components/FavoritesPage'));




const PetsDiagnostic = React.lazy(() => import('./components/PetsDiagnostic'));


const Settings = React.lazy(() => import('./components/Settings'));


// Loading component for lazy loaded routes
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto mb-4"></div>
      <p className="text-gray-600 font-montserrat">Loading...</p>
    </div>
  </div>
);

// Protected Dashboards - wrapped with lazy loading
const ProtectedAdminDashboard = React.lazy(() => 
  import('./components/AdminDashboard').then(module => ({
    default: withRoleProtection(module.default, 'admin')
  }))
);



const ProtectedSupportDashboard = React.lazy(() => 
  import('./components/SupportDashboard').then(module => ({
    default: withRoleProtection(module.default, 'support')
  }))
);

const ProtectedVetNurseDashboard = React.lazy(() =>
  import('./components/VetNurseDashboard').then(module => {
    console.log('App.js Debug - Loading VetNurseDashboard component');
    return {
      default: withRoleProtection(module.default, 'vet_nurse')
    };
  })
);


// Home page component
const HomePage = () => {
  // Scroll to top when component mounts (especially for mobile)
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use instant for immediate scroll on page load
      });
    };

    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Immediate scroll
      scrollToTop();
      
      // Also scroll after a small delay to ensure page is fully rendered
      setTimeout(scrollToTop, 100);
    }
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home" className="pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-left lg:col-span-3 order-2 lg:order-1">
              <div className="max-w-full lg:max-w-[80%]">
                <h1 className="font-bold mb-4 font-montserrat text-3xl sm:text-4xl lg:text-4xl xl:text-5xl leading-tight">
                  <span className="text-[#1F2937]">24/7 Smarter Pet Care</span>
                  <br />
                  <span className="text-[#F88C50] mt-1 sm:mt-2 block">AI Triage + Vet Consults</span>
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-[#1F2937] opacity-80 mb-6 mt-3 font-montserrat max-w-full sm:max-w-[640px] text-left font-normal leading-relaxed">
                <span className="font-semibold">No more waiting, guessing, or stressing when your pet feels unwell.</span>
                <br /><br />
                Get instant, intelligent guidance anytime — and speak to a verified nurse if needed. Faster answers, fewer unnecessary vet visits, peace of mind at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                <a 
                  href="/luni-triage" 
                  className="inline-block bg-[#5EB47C] hover:bg-[#4A9A64] hover:shadow-lg text-white py-3 px-6 rounded-xl text-sm sm:text-base font-montserrat transition-all duration-200 text-center font-medium"
                >
                  Start Free Triage
                </a>
                <a 
                  href="/marketplace" 
                  className="inline-block bg-transparent border border-[#5EB47C] text-[#5EB47C] hover:bg-[#5EB47C] hover:text-white hover:border-[#4A9A64] py-3 px-6 rounded-xl text-sm sm:text-base font-montserrat transition-all duration-200 text-center font-medium"
                >
                  Petcare Hub
                </a>
              </div>
            </div>

            {/* Right side - Scrollable Images for Mobile, 2x2 Grid for Desktop */}
            <div className="lg:col-span-2 justify-self-end w-full max-w-[320px] sm:max-w-[480px] lg:max-w-[530px] mx-auto lg:mx-0 order-1 lg:order-2">
              
              {/* Mobile: Horizontal Scrollable Gallery */}
              <div className="block lg:hidden">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
                  <div className="flex-shrink-0 rounded-xl overflow-hidden w-[200px] aspect-[4/5] snap-center group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-1%20(1).png" 
                      alt="Dog" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-shrink-0 rounded-xl overflow-hidden w-[200px] aspect-[4/5] snap-center group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-2%20(1).png" 
                      alt="Cat" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-shrink-0 rounded-xl overflow-hidden w-[200px] aspect-[4/5] snap-center group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-3%20(1).png" 
                      alt="Rabbit" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-shrink-0 rounded-xl overflow-hidden w-[200px] aspect-[4/5] snap-center group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-4%20(1).png" 
                      alt="Bird" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                {/* Scroll indicator dots */}
                <div className="flex justify-center mt-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#5EB47C] opacity-80"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>

              {/* Desktop: 2x2 Grid */}
              <div className="hidden lg:flex flex-col gap-2 sm:gap-3">
                <div className="flex gap-2 sm:gap-3">
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden flex-1 aspect-[230/277] max-w-[180px] sm:max-w-[220px] lg:max-w-[253px] group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-1%20(1).png" 
                      alt="Dog" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden flex-1 aspect-[230/277] max-w-[180px] sm:max-w-[220px] lg:max-w-[253px] group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-2%20(1).png" 
                      alt="Cat" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden flex-1 aspect-[230/277] max-w-[180px] sm:max-w-[220px] lg:max-w-[253px] group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-3%20(1).png" 
                      alt="Rabbit" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden flex-1 aspect-[230/277] max-w-[180px] sm:max-w-[220px] lg:max-w-[253px] group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img 
                      src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//hero-4%20(1).png" 
                      alt="Bird" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators & Statistics Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-1 sm:mb-2 font-montserrat">10K+</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-montserrat">Pet Consultations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-1 sm:mb-2 font-montserrat">500+</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-montserrat">Verified Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-1 sm:mb-2 font-montserrat">24/7</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-montserrat">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-1 sm:mb-2 font-montserrat">98%</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-montserrat">Client Satisfaction</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 lg:gap-8 opacity-60">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 font-montserrat">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#5EB47C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 font-montserrat">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 font-montserrat hidden sm:inline">Veterinary Certified</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 font-montserrat sm:hidden">Certified</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700 font-montserrat">5-Star Rated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
              See Luni Triage in Action
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-montserrat leading-relaxed">
              Watch how our AI-powered triage system transforms pet healthcare in under 2 minutes
            </p>
          </div>
          
          {/* Video Placeholder */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video flex items-center justify-center">
              {/* Video Placeholder Content */}
              <div className="text-center text-white">
                <div className="bg-white/10 p-6 rounded-full mb-6 mx-auto w-24 h-24 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Luni Triage Demo</h3>
                <p className="text-gray-300 mb-6">See how AI-powered triage works for pet owners, clinics, and vet schools</p>
                <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Play Demo Video
                </button>
              </div>
            </div>
            
            {/* Video overlay for when actual video is added */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Video Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pet Owner Experience</h4>
              <p className="text-gray-600 text-sm">See how pet parents get instant AI guidance and connect with professionals</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Clinic Integration</h4>
              <p className="text-gray-600 text-sm">Discover how practices reduce triage time by 77% with AI-powered workflows</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Educational Platform</h4>
              <p className="text-gray-600 text-sm">Learn how vet schools use our platform for risk-free student training</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 font-montserrat leading-tight">
              Trusted by Pet Care Professionals
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-montserrat leading-relaxed">
              See how our platform is transforming pet care delivery across Australia and New Zealand
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Case Study 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                  <img 
                    src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//Screenshot%202025-07-29%20at%203.20.12%20PM.png" 
                    alt="Tracey Wilson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-[#1F2937] font-montserrat font-semibold">Tracey Wilson</p>
                  <p className="text-sm text-[#1F2937] opacity-70 font-montserrat">Pet Owner, Wellington</p>
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-montserrat">Verified Review</span>
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-[#1F2937] opacity-80 font-montserrat leading-relaxed mb-4">
                "Luniby's AI triage saved my dog's life. At 2AM when my Golden Retriever showed distress symptoms, the platform immediately identified it as a potential emergency and connected me with a veterinarian within minutes."
              </p>
              <div className="text-xs text-gray-500 font-montserrat">
                <span className="font-semibold">Result:</span> Emergency surgery performed same night, full recovery
              </div>
            </div>

            {/* Case Study 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                  <img 
                    src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//Screenshot%202025-07-29%20at%203.27.18%20PM.png" 
                    alt="Dr. Amber Chen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-black font-montserrat font-semibold">Dr. Amber Chen</p>
                  <p className="text-sm text-black opacity-70 font-montserrat">Veterinarian, Auckland Central Clinic</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-[#E5F4F1] text-[#4A9A64] px-2 py-1 rounded-full font-montserrat">Partner Provider</span>
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-black opacity-80 font-montserrat leading-relaxed mb-4">
                "Since integrating with Luniby, our clinic efficiency increased by 40%. The AI pre-screening means we see the right cases at the right time, and our nurses can handle routine consultations remotely."
              </p>
              <div className="text-xs text-gray-500 font-montserrat">
                <span className="font-semibold">Impact:</span> 200+ remote consultations monthly, 40% efficiency gain
              </div>
            </div>

            {/* Case Study 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                  <img 
                    src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//Screenshot%202025-07-29%20at%203.25.28%20PM.png" 
                    alt="Cameron Rodriguez"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-black font-montserrat font-semibold">Cameron Rodriguez</p>
                  <p className="text-sm text-black opacity-70 font-montserrat">Professional Dog Trainer, Christchurch</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-montserrat">Top Rated</span>
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-black opacity-80 font-montserrat leading-relaxed mb-4">
                "Luniby transformed my training business. The platform's booking system and client management tools helped me scale from 20 to 150+ clients in 8 months, with seamless payment processing."
              </p>
              <div className="text-xs text-gray-500 font-montserrat">
                <span className="font-semibold">Growth:</span> 650% client increase, streamlined operations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Luni Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm sm:text-base text-[#1F2937] opacity-70 mb-2 font-montserrat uppercase tracking-wide font-medium">Why Choose Us?</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1F2937] font-montserrat leading-tight">
              The Future of Pet Healthcare is Here
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Instant AI Triage */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl mb-4 sm:mb-6 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl text-black mb-3 sm:mb-4 font-montserrat font-medium">Instant AI Triage</h3>
              <p className="text-sm sm:text-base text-black opacity-75 font-montserrat leading-relaxed">
                Get immediate, intelligent health assessments in seconds.<br />
                Our 7-criteria AI system provides professional-grade triage guidance 24/7.
              </p>
            </div>

            {/* Card 2: Professional Health Reports - Highlighted */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm text-center" style={{backgroundColor: '#E5F4F1'}}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#00C27C] bg-opacity-20 rounded-2xl mb-4 sm:mb-6 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl text-black mb-3 sm:mb-4 font-montserrat font-medium">Professional Health Reports</h3>
              <p className="text-sm sm:text-base text-black opacity-75 font-montserrat leading-relaxed">
                Generate veterinary-grade documentation automatically.<br />
                Every assessment creates professional Health Reports for your vet visits.
              </p>
            </div>

            {/* Card 3: Multi-Audience Platform */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl mb-4 sm:mb-6 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl text-black mb-3 sm:mb-4 font-montserrat font-medium">For Everyone</h3>
              <p className="text-sm sm:text-base text-black opacity-75 font-montserrat leading-relaxed">
                Pet owners, veterinary clinics, and vet schools all benefit.<br />
                One platform serving the entire veterinary care ecosystem.
              </p>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="mt-16 bg-gray-800 rounded-2xl px-8 py-12 text-white text-center">
            <h3 className="text-2xl font-bold mb-6">Our Mission: Save 90,000+ Pets' Lives</h3>
            <p className="opacity-90 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Through better AI triage, improved vet training, and enhanced clinic workflows, 
              we're building technology that could save tens of thousands of pets over the next decade.
            </p>
            <a 
              href="/luni-triage"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 font-montserrat shadow-lg hover:shadow-xl hover:bg-gray-100"
            >
              Try Luni Triage Free
            </a>
          </div>
        </div>
      </section>

      {/* Clinic Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm font-semibold flex items-center font-montserrat">
                <span className="text-xl mr-2">🏥</span>
                For Veterinary Clinics
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 font-montserrat leading-tight">
              Transform Your Practice with LuniGen API
            </h2>
            <p className="text-base sm:text-lg text-black opacity-75 max-w-3xl mx-auto font-montserrat leading-relaxed">
              Integrate AI-powered triage directly into your practice management system. Join leading clinics reducing triage time by 77%.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-montserrat">77% Faster Triage</h3>
                  <p className="text-gray-600 font-montserrat">Reduce average phone triage time from 8 minutes to 2 minutes with AI-powered assessment</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-montserrat">Seamless Integration</h3>
                  <p className="text-gray-600 font-montserrat">Works with VetSpace, AVImark, and other popular practice management systems</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-montserrat">Professional Documentation</h3>
                  <p className="text-gray-600 font-montserrat">Auto-generated Health Reports meeting NZVA and AVA professional standards</p>
                </div>
              </div>
            </div>

            {/* Right side - CTA and Stats */}
            <div className="text-center lg:text-left">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                  Ready to Integrate?
                </h3>
                <p className="text-gray-600 mb-6 font-montserrat leading-relaxed">
                  Join 500+ veterinary practices already using LuniGen API to streamline workflows and improve patient outcomes.
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#5EB47C] font-montserrat">$50k+</div>
                    <div className="text-xs text-gray-600 font-montserrat">Annual Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#5EB47C] font-montserrat">3 mo</div>
                    <div className="text-xs text-gray-600 font-montserrat">Payback Period</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#5EB47C] font-montserrat">&lt;1s</div>
                    <div className="text-xs text-gray-600 font-montserrat">API Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#5EB47C] font-montserrat">99.9%</div>
                    <div className="text-xs text-gray-600 font-montserrat">Uptime SLA</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <a 
                    href="/clinics" 
                    className="block bg-[#5EB47C] hover:bg-[#4A9A64] text-white py-3 px-6 rounded-xl font-montserrat font-semibold transition-all duration-200 text-center"
                  >
                    View API Pricing & Integration
                  </a>
                  <a 
                    href="/api-docs" 
                    className="block bg-transparent border border-gray-400 text-gray-700 hover:bg-gray-100 py-3 px-6 rounded-xl font-montserrat font-medium transition-all duration-200 text-center"
                  >
                    📚 Technical Documentation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Showcase Section */}
      <section id="marketplace-showcase" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 font-montserrat leading-tight">
              Discover Our Petcare Hub
            </h2>
            <p className="text-base sm:text-lg text-black opacity-75 max-w-3xl mx-auto font-montserrat leading-relaxed">
              Browse real services and products from verified providers across New Zealand and Australia.
            </p>
          </div>
          
          {/* Horizontal Sliding Marketplace Carousel */}
          <div className="relative mb-12">
            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Container */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4" style={{width: 'max-content'}}>
                {/* Listing 1 - Veterinary */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-blue-700">
                        <div className="text-4xl mb-2">🏥</div>
                        <div className="font-semibold">Online Consultation</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Veterinary
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Dr. Sarah Chen - Online Consultation</h3>
                    <p className="text-gray-600 text-sm mb-3">Licensed veterinarian • Auckland Central</p>
                    <p className="text-gray-700 text-sm mb-4">Professional veterinary consultation via video call. Health assessments and treatment advice.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$75 NZD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 4.9</span>
                        <span className="text-xs text-gray-500 ml-1">(127)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 2 - Grooming */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-pink-100 to-pink-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-pink-700">
                        <div className="text-4xl mb-2">✂️</div>
                        <div className="font-semibold">Mobile Grooming</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Grooming
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Pampered Paws Mobile Grooming</h3>
                    <p className="text-gray-600 text-sm mb-3">Certified groomer • Wellington region</p>
                    <p className="text-gray-700 text-sm mb-4">Complete grooming service at your home. Wash, cut, nail trim, and styling for all breeds.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$85 NZD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 4.8</span>
                        <span className="text-xs text-gray-500 ml-1">(89)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 3 - Training */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-purple-700">
                        <div className="text-4xl mb-2">🎓</div>
                        <div className="font-semibold">Dog Training</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Training
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Cameron Rodriguez - Dog Training</h3>
                    <p className="text-gray-600 text-sm mb-3">Certified trainer • Christchurch area</p>
                    <p className="text-gray-700 text-sm mb-4">Professional dog training for obedience, behavioral issues, and puppy training sessions.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$120 AUD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 5.0</span>
                        <span className="text-xs text-gray-500 ml-1">(156)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 4 - Premium Product */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-green-700">
                        <div className="text-4xl mb-2">🦴</div>
                        <div className="font-semibold">Premium Food</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Product
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Royal Canin Vet Diet</h3>
                    <p className="text-gray-600 text-sm mb-3">Prescription dog food • 2kg</p>
                    <p className="text-gray-700 text-sm mb-4">Veterinary recommended nutrition for dogs with digestive sensitivities and health needs.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$89 NZD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 4.7</span>
                        <span className="text-xs text-gray-500 ml-1">(243)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 5 - Health Product */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-orange-700">
                        <div className="text-4xl mb-2">💊</div>
                        <div className="font-semibold">Supplements</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Health
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Joint Care Plus Supplements</h3>
                    <p className="text-gray-600 text-sm mb-3">Hip & joint supplement • 60 tablets</p>
                    <p className="text-gray-700 text-sm mb-4">Natural joint support for dogs and cats. Glucosamine and chondroitin formula.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$42 AUD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 4.6</span>
                        <span className="text-xs text-gray-500 ml-1">(78)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 6 - Holistic Service */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-teal-100 to-teal-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-teal-700">
                        <div className="text-4xl mb-2">🌿</div>
                        <div className="font-semibold">Holistic Care</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Holistic
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Natural Pet Wellness Therapy</h3>
                    <p className="text-gray-600 text-sm mb-3">Holistic therapist • Sydney area</p>
                    <p className="text-gray-700 text-sm mb-4">Natural healing approaches including acupuncture, herbal remedies, and wellness therapy.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$95 AUD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 4.9</span>
                        <span className="text-xs text-gray-500 ml-1">(64)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 7 - Pet Toy */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-yellow-700">
                        <div className="text-4xl mb-2">🎾</div>
                        <div className="font-semibold">Interactive Toy</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Toy
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Smart Puzzle Feeder</h3>
                    <p className="text-gray-600 text-sm mb-3">Interactive feeding toy • Slow eating</p>
                    <p className="text-gray-700 text-sm mb-4">Engages your pet during mealtime, promotes healthy eating habits and mental stimulation.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$34 NZD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 4.8</span>
                        <span className="text-xs text-gray-500 ml-1">(192)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing 8 - Breeding Service */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer" style={{width: '280px', flexShrink: 0}}>
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-indigo-700">
                        <div className="text-4xl mb-2">🐕</div>
                        <div className="font-semibold">Breeding Services</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Breeding
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2">Premium Golden Retriever Breeding</h3>
                    <p className="text-gray-600 text-sm mb-3">Registered breeder • Auckland</p>
                    <p className="text-gray-700 text-sm mb-4">Champion bloodline Golden Retrievers with health certifications and breeding consultation.</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">$2,200 NZD</div>
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm">⭐ 5.0</span>
                        <span className="text-xs text-gray-500 ml-1">(23)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              <div className="w-2 h-2 bg-[#5EB47C] rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* View More Section */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6 font-montserrat">
              Discover 500+ verified providers and premium products in our Petcare Hub
            </p>
            <a 
              href="/marketplace"
              className="bg-[#5EB47C] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#4A9A64] transition-colors font-montserrat shadow-lg"
            >
              View All Services & Products
            </a>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 sm:mb-6 font-montserrat leading-tight">
            Ready to Experience the Future of Pet Healthcare?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-6 sm:mb-8 font-montserrat leading-relaxed max-w-2xl mx-auto">
            Join thousands of pet owners, hundreds of clinics, and leading vet schools using Luni Triage across Australia and New Zealand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
            <a 
              href="/luni-triage" 
              className="bg-white text-gray-900 hover:bg-gray-100 hover:shadow-lg py-3 px-6 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 font-montserrat text-center"
            >
              Try AI Triage Free
            </a>
            <a 
              href="/pricing" 
              className="inline-block bg-transparent border border-white text-white hover:bg-white hover:text-gray-900 py-3 px-6 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 font-montserrat text-center"
            >
              Learn How It Works
            </a>
            <a 
              href="/marketplace" 
              className="inline-block bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white py-3 px-6 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 font-montserrat text-center sm:hidden lg:inline-block"
            >
              Browse Petcare Hub
            </a>
          </div>
          <div className="sm:hidden mt-4">
            <a 
              href="/marketplace" 
              className="inline-block bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 font-montserrat text-center w-full max-w-xs"
            >
              Browse Petcare Hub
            </a>
          </div>
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 font-montserrat">
            <p>✓ Free AI triage  ✓ Professional Health Reports  ✓ 24/7 availability</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 font-montserrat">Luniby</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 font-montserrat leading-relaxed text-sm sm:text-base">
                Connecting pet parents with trusted care providers and premium products. 
                Your pet's health and happiness is our priority.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm sm:text-base">📘</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm sm:text-base">📷</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm sm:text-base">🐦</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 font-montserrat">Platform</h4>
              <ul className="space-y-2 text-gray-300 font-montserrat text-sm sm:text-base">
                <li><a href="/luni-triage" className="hover:text-white transition-colors">AI Triage System</a></li>
                <li><a href="/marketplace" className="hover:text-white transition-colors">Petcare Hub</a></li>
                <li><a href="/clinics" className="hover:text-white transition-colors">API for Clinics</a></li>
                <li><button className="hover:text-white transition-colors text-left">Practice Management</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 font-montserrat">Enterprise</h4>
              <ul className="space-y-2 text-gray-300 font-montserrat text-sm sm:text-base">
                <li><a href="/api-docs" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="/clinics" className="hover:text-white transition-colors">Integration Support</a></li>
                <li><button className="hover:text-white transition-colors text-left">Security & Compliance</button></li>
                <li><button className="hover:text-white transition-colors text-left">Enterprise Sales</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 font-montserrat text-sm sm:text-base">
              © 2025 Luniby Group. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Use regular Router - Sentry will automatically track route changes

// Error fallback component for Sentry
function ErrorFallback({ resetError }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              We've been notified about this error and will fix it soon.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={resetError}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      <NotificationProvider>
        <FavoritesProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/marketplace" element={<LiveMarketplace />} />
                  <Route path="/provider/:providerId" element={<ProviderDetail />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/provider-signup" element={<ProviderSignUp />} />
                  <Route path="/simple-signup" element={<SimpleProviderSignUp />} />
                  <Route path="/luni-triage" element={<LuniTriage />} />
                  <Route path="/triage-status" element={<TriageStatus />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  
                  {/* Enterprise Routes */}
                  <Route path="/admin" element={<ProtectedAdminDashboard />} />
                  <Route path="/privacy" element={<DataPrivacy />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                  
                  {/* Role-specific Dashboards */}
                  <Route path="/pet-owner-dashboard" element={<PetOwnerDashboard />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/clinics" element={<ClinicPage />} />
                  <Route path="/vet-schools" element={<VetSchoolsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/investors" element={<InvestorsPage />} />
                  <Route path="/upgrade" element={<PremiumOnboarding />} />
                  <Route path="/api-docs" element={<APIDocumentation />} />

                  <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
                  <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
                  <Route path="/breeder-dashboard" element={<BreederDashboard />} />
                  <Route path="/nutritionist-dashboard" element={<NutritionistDashboard />} />
                  <Route path="/pet-business-dashboard" element={<PetBusinessDashboard />} />
                  <Route path="/holistic-care-dashboard" element={<HolisticCareDashboard />} />
                  <Route path="/support-dashboard" element={<ProtectedSupportDashboard />} />
                  <Route path="/vet-nurse-dashboard" element={<ProtectedVetNurseDashboard />} />
                  <Route path="/veterinarian-portal" element={<VetDashboard />} />
                  <Route path="/veterinarian-dashboard" element={<Navigate to="/veterinarian-portal" replace />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/favorites" element={<FavoritesPage />} />



                  
                  {/* Debug Routes */}


                                     <Route path="/debug/pets" element={<PetsDiagnostic />} />



                   
                   {/* Pet Management Routes */}
                   <Route path="/pets" element={<PetOwnerDashboard />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </FavoritesProvider>
      </NotificationProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;