import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const PricingPage = () => {
  const [, setUser] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Check user's current plan from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
      
      setCurrentPlan(profile?.subscription_plan || 'free');
    }
  };

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started with basic pet care',
      features: [
        'Up to 3 pets',
        'Basic health records',
        'Marketplace access',
        'Standard notifications',
        'Basic pet profiles',
        'Community support'
      ],
      limitations: [
        'Limited AI triage (3/month)',
                      '1 Luni Triage per week',
        'No advanced analytics',
        'No SOAP notes',
        'No priority booking'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    premium: {
      name: 'Premium',
      price: { monthly: 9.99, annual: 99.99 },
      description: 'Complete pet care management for serious pet parents',
      features: [
        'Unlimited pets',
        'Unlimited AI triage consultations',
        'Unlimited Luni Triage access',
        'Advanced health analytics & charts',
        'Professional SOAP notes',
        'Priority booking & support',
        'Vaccination tracking & alerts',
        'Health trend analysis',
        'Data export capabilities',
        'Emergency support hotline',
        'Veterinary-grade records'
      ],
      savings: 'Save $20/year',
      cta: 'Start Free Trial',
      popular: true,
      badge: 'Most Popular'
    }
  };

  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'Auckland, NZ',
      pets: '3 dogs, 1 cat',
      quote: 'This app saved me $400 on an emergency vet visit. The AI triage helped me realize my dog\'s symptoms weren\'t urgent and could wait until morning.',
      savings: '$400',
      avatar: '👩‍🦰'
    },
    {
      name: 'Mike R.',
      location: 'Melbourne, AU',
      pets: '2 cats',
      quote: 'Managing my cats\' vaccination schedules used to be a nightmare. Now I get alerts before they\'re due and never miss an appointment.',
      savings: 'Peace of mind',
      avatar: '👨‍💼'
    },
    {
      name: 'Jennifer L.',
      location: 'Sydney, AU',
      pets: '1 senior dog',
      quote: 'The health analytics helped me track my senior dog\'s arthritis progression. My vet was impressed with the detailed records.',
      savings: 'Better care',
      avatar: '👩‍⚕️'
    }
  ];

  const valueProps = [
    {
      icon: '💰',
      title: 'Save Money',
      description: 'Prevent expensive emergency visits with AI-powered health guidance',
      value: 'Average savings: $300-500/year'
    },
    {
      icon: '⏰',
      title: 'Save Time',
      description: 'Manage all your pet care in one place with smart automation',
      value: 'Save 2-3 hours/month'
    },
    {
      icon: '🏥',
      title: 'Better Health Outcomes',
      description: 'Proactive care with professional-grade health tracking',
      value: 'Early detection & prevention'
    },
    {
      icon: '📱',
      title: 'Professional Tools',
      description: 'Veterinary-grade SOAP notes and health analytics',
      value: 'Vet-approved records'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-white text-gray-800 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Page Identity Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                <span className="text-xl mr-2">🐾</span>
                For Pet Owners
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold mb-6">
              Premium Pet Care That Pays for Itself
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
              Join thousands of pet parents who save money and provide better care with our comprehensive pet management platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">$400</div>
                <div className="text-sm text-gray-600">Average savings per emergency avoided</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">98%</div>
                <div className="text-sm text-gray-600">Customer satisfaction rate</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">24/7</div>
                <div className="text-sm text-gray-600">AI health guidance available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🐾</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works for Pet Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, smart pet care in three easy steps. Our AI-powered platform guides you through every aspect of your pet's health journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#5EB47C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-[#5EB47C] hidden md:block md:translate-x-8"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tell Us About Your Pet</h3>
              <p className="text-gray-600 mb-4">
                Share your pet's symptoms, behavior, and health concerns through our intuitive AI triage system. No medical knowledge required.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <strong>✨ AI analyzes:</strong> Symptoms, urgency level, and care recommendations in real-time
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#5EB47C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-[#5EB47C] hidden md:block md:translate-x-8"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Instant Guidance</h3>
              <p className="text-gray-600 mb-4">
                Receive immediate AI-powered health insights, care recommendations, and severity assessments. Know when to wait, when to call, or when to rush to the vet.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <strong>🩺 Includes:</strong> SOAP notes, health tracking, and emergency protocols
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#5EB47C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect with Experts</h3>
              <p className="text-gray-600 mb-4">
                When needed, instantly connect with verified veterinary nurses or book consultations with local providers through our marketplace.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <strong>🏥 Access to:</strong> Licensed professionals, emergency support, and ongoing care management
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <div className="flex justify-center mb-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Pet's Healthcare?</h3>
              <p className="text-lg mb-6 opacity-90">
                Start with our free plan and upgrade when you're ready for premium features
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/luni-triage"
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Try Free Triage Now
                </Link>
                <a
                  href="#pricing-plans"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                >
                  View Plans & Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Results Speak for Themselves
            </h2>
            <p className="text-xl text-gray-600">
              See why thousands of pet parents trust our platform for their pet's health and well-being
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{prop.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{prop.title}</h3>
                <p className="text-gray-600 mb-3">{prop.description}</p>
                <div className="text-sm font-medium text-[#5EB47C]">{prop.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Pricing Toggle */}
      <div id="pricing-plans" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade when you're ready for advanced features. Every plan includes our core AI triage system.
            </p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#5EB47C] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-[#5EB47C] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="absolute -top-6 -right-6 bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  plan.popular ? 'border-[#5EB47C] scale-105' : 'border-gray-200'
                } ${currentPlan === key ? 'ring-4 ring-green-200' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#5EB47C] text-white px-4 py-2 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                {currentPlan === key && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-gray-600">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    
                    {billingCycle === 'annual' && plan.savings && (
                      <div className="text-sm text-green-600 font-medium mb-4">
                        {plan.savings}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Included Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.limitations && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    {currentPlan === key ? (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <Link
                        to={key === 'premium' ? '/upgrade' : '/signup'}
                        className={`block w-full py-3 px-6 rounded-lg font-medium text-center transition-all ${
                          plan.popular
                            ? 'bg-[#5EB47C] text-white hover:bg-[#4A9A64] shadow-lg hover:shadow-xl'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                  
                  {key === 'premium' && (
                    <p className="text-center text-sm text-gray-500 mt-4 pt-2">
                      30-day free trial • Cancel anytime • No hidden fees
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real Stories from Pet Parents
            </h2>
            <p className="text-xl text-gray-600">
              See how our platform has made a difference for pets and their families
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                    <div className="text-sm text-gray-500">{testimonial.pets}</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm font-medium text-[#5EB47C]">
                  💰 {testimonial.savings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                How does the AI triage work?
              </h3>
              <p className="text-gray-700">
                Our AI analyzes your pet's symptoms and provides guidance on urgency level, 
                potential causes, and whether immediate veterinary care is needed. It's trained 
                on thousands of veterinary cases but never replaces professional veterinary advice.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my premium subscription anytime?
              </h3>
              <p className="text-gray-700">
                Yes! You can cancel your premium subscription at any time. You'll continue to 
                have access to premium features until your current billing period ends, then 
                automatically switch to the free plan.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-700">
                All your pet data is always preserved. If you downgrade to free, you'll be 
                limited to 2 pets and basic features, but all historical data remains accessible 
                if you upgrade again later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your free trial today and see why thousands of pet parents trust us with their furry family members
          </p>
          <div className="flex justify-center">
            <Link
              to="/luni-triage"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Try Free AI Triage
            </Link>
          </div>
          <p className="text-sm opacity-75 mt-4">
            No credit card required for free trial • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;