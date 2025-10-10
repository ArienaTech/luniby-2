import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const PremiumOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/signin');
      return;
    }
    setUser(user);
  };

  const steps = [
    {
      id: 1,
      title: "Welcome to Premium!",
      subtitle: "You're about to unlock the full potential of pet care management",
      content: "benefits"
    },
    {
      id: 2,
      title: "Choose Your Plan",
      subtitle: "Select the billing cycle that works best for you",
      content: "pricing"
    },
    {
      id: 3,
      title: "Start Your Free Trial",
      subtitle: "No payment required - try Premium free for 30 days",
      content: "trial"
    }
  ];

  const benefits = [
    {
      icon: '🐾',
      title: 'Unlimited Pets',
      description: 'Add and manage as many pets as your heart desires',
      value: 'No limits'
    },
    {
      icon: '🤖',
      title: 'Unlimited AI Triage & Cases',
      description: '24/7 AI-powered health guidance with unlimited case creation',
      value: 'No daily limits • Save $200+ per emergency avoided'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Health trends, vaccination tracking, and insights',
      value: 'Professional-grade reports'
    },
    {
      icon: '🏥',
      title: 'SOAP Notes',
      description: 'Veterinary-grade medical records and documentation',
      value: 'Vet-approved format'
    },
    {
      icon: '⚡',
      title: 'Priority Support',
      description: 'Get help when you need it most with priority access',
      value: 'VIP treatment'
    },
    {
      icon: '📱',
      title: 'Data Export',
      description: 'Take your pet\'s data anywhere, anytime',
      value: 'Complete ownership'
    }
  ];

  const plans = {
    monthly: {
      price: 9.99,
      period: 'month',
      total: 9.99,
      savings: null
    },
    annual: {
      price: 99.99,
      period: 'year',
      total: 99.99,
      savings: '$20/year',
      monthlyEquivalent: 8.33
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would integrate with Stripe or another payment processor
      // For now, we'll simulate the upgrade process
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Update user's subscription in database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: 'premium',
          subscription_period: selectedPlan,
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('id', user.id);

      if (error) throw error;

      // Redirect to success page or dashboard
      navigate('/pet-owner-dashboard?upgraded=true');
      
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('There was an issue starting your trial. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    const step = steps.find(s => s.id === currentStep);
    
    switch (step.content) {
      case 'benefits':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{benefit.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{benefit.description}</p>
                      <div className="text-sm font-medium text-[#5EB47C]">{benefit.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Average Customer Savings: $400+ per year
              </h3>
              <p className="text-gray-600">
                Just one avoided emergency vet visit pays for your entire annual subscription
              </p>
            </div>
          </div>
        );
        
      case 'pricing':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  className={`relative bg-white rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === key 
                      ? 'border-[#5EB47C] ring-4 ring-[#5EB47C]/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  {key === 'annual' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{key}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    
                    {plan.monthlyEquivalent && (
                      <div className="text-sm text-gray-600 mb-2">
                        ${plan.monthlyEquivalent}/month when billed annually
                      </div>
                    )}
                    
                    {plan.savings && (
                      <div className="text-sm font-medium text-green-600 mb-4">
                        Save {plan.savings}
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        30-day free trial
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cancel anytime
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'trial':
        return (
          <div className="text-center space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#5EB47C] to-green-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Your 30-Day Free Trial
              </h3>
              
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">No payment required</div>
                    <div className="text-sm text-gray-600">Try all Premium features completely free</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Cancel anytime</div>
                    <div className="text-sm text-gray-600">No commitment, cancel with one click</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">Keep your data</div>
                    <div className="text-sm text-gray-600">All your pet information stays with you</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Selected Plan: <span className="font-medium capitalize">{selectedPlan}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ${plans[selectedPlan].price}/{plans[selectedPlan].period}
                </div>
                {plans[selectedPlan].savings && (
                  <div className="text-sm text-green-600 font-medium">
                    {plans[selectedPlan].savings}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="text-[#5EB47C] hover:text-[#4A9A64]">
              ← Back to Dashboard
            </Link>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className={`h-1 ${
                  step.id <= currentStep ? 'bg-[#5EB47C]' : 'bg-gray-200'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {steps[currentStep - 1].title}
          </h1>
          <p className="text-xl text-gray-600">
            {steps[currentStep - 1].subtitle}
          </p>
        </div>

        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-[#5EB47C] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4A9A64] transition-colors shadow-md hover:shadow-lg"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Trial...
                </div>
              ) : (
                'Start Free Trial'
              )}
            </button>
          )}
        </div>

        {/* Trust Signals */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trusted by 10,000+ pet parents
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bank-level security
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              24/7 customer support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumOnboarding;