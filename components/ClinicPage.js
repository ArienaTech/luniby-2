import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ClinicPage = () => {
  const [showDemo, setShowDemo] = useState(false);

  const pricingPlans = {
    starter: {
      name: 'Starter',
      price: 299,
      subtitle: 'Perfect for small clinics',
      features: [
        '500 API assessments/month',
        'Basic Health Report generation', 
        'Email support',
        '1 practice management integration',
        'Basic analytics dashboard',
        'NZVA/AVA compliant documentation'
      ],
      target: '1-3 veterinarians',
      savings: '$200-300/month in staff time',
      popular: false
    },
    professional: {
      name: 'Professional',
      price: 599,
      subtitle: 'Most popular for growing practices',
      features: [
        '2,000 API assessments/month',
        'Advanced Health Reports + medical history',
        'Phone support',
        'Multiple integrations (VetSpace, AVImark)',
        'Advanced analytics + reporting',
        'Priority processing (<1 second)',
        'Staff training materials',
        'Custom workflow setup'
      ],
      target: '4-8 veterinarians', 
      savings: '$800-1200/month in staff time',
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: 1299,
      subtitle: 'For large practices and hospitals',
      features: [
        'Unlimited API assessments',
        'White-label integration',
        'Dedicated account manager',
        'Custom integrations',
        'Real-time phone support',
        'Advanced reporting + insights',
        'Staff training included',
        'SLA guarantees (99.9% uptime)'
      ],
      target: '9+ veterinarians',
      savings: '$2000+ monthly savings',
      popular: false
    }
  };

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      clinic: 'Auckland Central Veterinary',
      quote: 'LuniGen API reduced our triage time by 77%. We process 200+ cases monthly through the integration, saving 40 hours per week.',
      stats: '77% time reduction, 200+ cases/month'
    },
    {
      name: 'Dr. Michael Roberts',
      clinic: 'Melbourne Animal Hospital',
      quote: 'The seamless VetSpace integration was incredible. Our nurses can focus on in-person care while the AI handles phone triage.',
      stats: 'Seamless integration, improved workflow'
    },
    {
      name: 'Dr. Emma Thompson',
      clinic: 'Wellington Veterinary Group',
      quote: 'Professional Health Reports generated automatically save us 2-3 hours daily on documentation. The ROI was immediate.',
      stats: '2-3 hours saved daily, immediate ROI'
    }
  ];

  const integrationPartners = [
    { name: 'VetSpace', logo: '🏥', description: 'New Zealand\'s leading veterinary software' },
    { name: 'AVImark', logo: '📊', description: 'Popular Australian practice management' },
    { name: 'eVetPractice', logo: '💻', description: 'Cloud-based veterinary software' },
    { name: 'RxWorks', logo: '💊', description: 'Prescription management integration' }
  ];

  const roiCalculator = (plan) => {
    const timesSaved = {
      starter: 2.5,
      professional: 10,
      enterprise: 20
    };
    
    const hourlyRate = 35; // Average vet nurse hourly rate in NZ/AU
    const monthlySavings = timesSaved[plan] * hourlyRate * 22; // 22 working days
    const yearlyROI = (monthlySavings * 12) - (pricingPlans[plan].price * 12);
    
    return {
      hoursSaved: timesSaved[plan],
      monthlySavings,
      yearlyROI
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Matching pattern */}
      <div className="bg-gradient-to-br from-green-50 to-white text-gray-800 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Page Identity Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                <span className="text-xl mr-2">🏥</span>
                For Veterinary Clinics
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold mb-6">
              LuniGen API for Veterinary Practice Integration
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
              Integrate AI-powered triage directly into your practice management system. 
              Reduce triage time by 77% while improving patient care quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">77%</div>
                <div className="text-sm text-gray-600">Reduction in triage time</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">$50k+</div>
                <div className="text-sm text-gray-600">Annual efficiency savings</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">3 mo</div>
                <div className="text-sm text-gray-600">Average payback period</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transform Your Practice Efficiency
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading veterinary practices across New Zealand and Australia trust LuniGen API 
              to streamline their triage workflows and improve patient outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">77% Faster Triage</h3>
              <p className="text-gray-600">Automated AI assessment reduces phone triage time from 8 minutes to 2 minutes average</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-green-50">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">$2000+ Monthly Savings</h3>
              <p className="text-gray-600">Free up staff time for in-person care, increasing revenue potential significantly</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-purple-50">
              <div className="text-4xl mb-4">🔌</div>
              <h3 className="text-xl font-bold mb-2">Seamless Integration</h3>
              <p className="text-gray-600">Works with VetSpace, AVImark, and other popular practice management systems</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-orange-50">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">Professional Health Reports</h3>
              <p className="text-gray-600">Auto-generated documentation meeting NZVA and AVA professional standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How LuniGen API Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple integration, powerful results
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#5EB47C] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-4">Client Calls Clinic</h3>
              <p className="text-gray-600 mb-4">Pet owner contacts your clinic with health concerns about their pet</p>
              <div className="bg-white p-4 rounded-lg border">
                <code className="text-sm text-gray-800">📞 "My dog has been vomiting since yesterday..."</code>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-[#5EB47C] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-4">Instant AI Assessment</h3>
              <p className="text-gray-600 mb-4">Your staff enters symptoms into your practice software, LuniGen API provides instant triage</p>
              <div className="bg-white p-4 rounded-lg border">
                <code className="text-sm text-gray-800">POST /api/triage → "MODERATE: Schedule within 6 hours"</code>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-[#5EB47C] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-4">Automated Documentation</h3>
              <p className="text-gray-600 mb-4">Professional Health Reports generated automatically and saved to patient record</p>
              <div className="bg-white p-4 rounded-lg border">
                <code className="text-sm text-gray-800">✅ Health Report created, appointment booked</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Veterinary Practices
            </h2>
            <p className="text-xl text-gray-600">
              See how clinics across New Zealand and Australia benefit from LuniGen API
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#5EB47C] rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.clinic}</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-4 italic">"{testimonial.quote}"</p>
                <div className="text-sm text-[#5EB47C] font-semibold">
                  📊 {testimonial.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Transparent pricing designed for practices of all sizes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {Object.entries(pricingPlans).map(([key, plan]) => {
              const roi = roiCalculator(key);
              return (
                <div key={key} className={`relative p-8 rounded-2xl border-2 ${plan.popular ? 'border-[#5EB47C] bg-white shadow-xl' : 'border-gray-200 bg-white'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#5EB47C] text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.subtitle}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-gray-600">{plan.target}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#5EB47C] mr-2">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">ROI Calculator</h4>
                    <p className="text-sm text-green-700">
                      💰 Save ${roi.monthlySavings.toLocaleString()}/month<br/>
                      ⏱️ {roi.hoursSaved} hours saved daily<br/>
                      📈 ${roi.yearlyROI.toLocaleString()} yearly ROI
                    </p>
                  </div>

                  <a 
                    href="/contact"
                    className={`block w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center ${
                      plan.popular 
                        ? 'bg-[#5EB47C] text-white hover:bg-[#4A9A64]' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Request Demo
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Works with your existing practice management software
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrationPartners.map((partner, index) => (
              <div key={index} className="text-center p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{partner.logo}</div>
                <h3 className="text-lg font-bold mb-2">{partner.name}</h3>
                <p className="text-gray-600 text-sm">{partner.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Don't see your practice management software?</p>
            <a 
              href="/contact"
              className="inline-block bg-[#5EB47C] text-white px-6 py-3 rounded-lg hover:bg-[#4A9A64] transition-colors"
            >
              Request Custom Integration
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How quickly can we integrate LuniGen into our practice?
              </h3>
              <p className="text-gray-700">
                Most practices are up and running within 2-4 weeks. Our technical team handles the integration 
                setup while your staff receives comprehensive training on the new workflow.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is LuniGen compliant with New Zealand and Australian standards?
              </h3>
              <p className="text-gray-700">
                Yes, LuniGen is developed in compliance with NZVA (New Zealand Veterinary Association) 
                and AVA (Australian Veterinary Association) professional guidelines. All documentation 
                meets regulatory requirements for medical record keeping.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens to our existing patient data?
              </h3>
              <p className="text-gray-700">
                LuniGen integrates with your existing patient records without disrupting your current data. 
                All assessments are saved directly to the patient's file in your practice management system.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can we customize the triage protocols for our specific practice?
              </h3>
              <p className="text-gray-700">
                Enterprise and Multi-Location plans include custom protocol development. We work with your 
                clinical team to adapt LuniGen's algorithms to your specific practice standards and preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join leading veterinary practices already using LuniGen to improve efficiency and patient outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/api-docs"
              className="bg-white text-[#5EB47C] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📚 View API Documentation
            </a>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-[#5EB47C] transition-colors"
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">LuniGen API Demo</h3>
              <button 
                onClick={() => setShowDemo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-8 text-white text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h4 className="text-xl font-semibold mb-4">Interactive API Demo</h4>
              <p className="text-gray-300 mb-6">
                See how LuniGen API integrates with your practice management system in real-time
              </p>
              <a 
                href="https://www.youtube.com/watch?v=demo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-[#5EB47C] text-white px-6 py-3 rounded-lg hover:bg-[#4A9A64] transition-colors"
              >
                Play Demo Video
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicPage;