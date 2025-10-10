import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const VetSchoolsPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const academicTestimonials = [
    {
      name: 'Prof. Lisa Thompson',
      title: 'Head of Clinical Studies',
      institution: 'Massey University',
      location: 'New Zealand',
      quote: 'Luni Triage has revolutionized our clinical training program. Students can now practice complex triage scenarios without any risk to live patients, building confidence before they enter real clinical settings.',
      avatar: '👩‍🎓',
      metrics: '95% student satisfaction'
    },
    {
      name: 'Dr. James Mitchell',
      title: 'Associate Professor',
      institution: 'University of Melbourne',
      location: 'Australia',
      quote: 'The NZVA and AVA compliant educational scenarios are exactly what we needed. Our students are graduating with much stronger diagnostic and triage skills.',
      avatar: '👨‍🏫',
      metrics: '40% improvement in clinical assessments'
    },
    {
      name: 'Dr. Sarah Chen',
      title: 'Director of Student Affairs',
      institution: 'University of Sydney',
      location: 'Australia',
      quote: 'The analytics dashboard helps us track student progress and identify areas where additional support is needed. It\'s transformed our approach to veterinary education.',
      avatar: '👩‍💼',
      metrics: '30% reduction in remedial training'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-white text-gray-800 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Page Identity Badge */}
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 text-purple-800 px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                <span className="text-xl mr-2">🎓</span>
                For Veterinary Schools
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold mb-6">
              Transform Veterinary Education with AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
              Prepare the next generation of veterinarians with risk-free, AI-powered triage training that meets NZVA and AVA educational standards
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">95%</div>
                <div className="text-sm text-gray-600">Student satisfaction rate</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">40%</div>
                <div className="text-sm text-gray-600">Improvement in clinical skills</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">Zero</div>
                <div className="text-sm text-gray-600">Risk to live patients</div>
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
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works for Veterinary Schools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Integrate AI-powered veterinary education into your curriculum. Provide students with safe, standardized learning experiences that build real-world competency.
            </p>
            
            <div className="bg-purple-50 rounded-xl p-6 max-w-3xl mx-auto border border-purple-200">
              <p className="text-purple-800 font-medium text-center">
                <span className="text-2xl mr-2">🎓</span>
                <strong>Career Impact:</strong> Each graduate will see 5,000–10,000 pets over their career. Training 100 students with 1% better decision-making = 5,000+ pets saved per graduating class
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 - Curriculum Integration */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#5EB47C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-[#5EB47C] hidden md:block md:translate-x-8"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Curriculum Integration</h3>
              <p className="text-gray-600 mb-4">
                Seamlessly integrate Luni Triage into your existing veterinary curriculum. NZVA and AVA compliant scenarios align with learning objectives and accreditation requirements.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <strong>📚 Includes:</strong> Course modules, assessment tools, and faculty training resources
              </div>
            </div>

            {/* Step 2 - Student Training */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#5EB47C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-[#5EB47C] hidden md:block md:translate-x-8"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk-Free Student Training</h3>
              <p className="text-gray-600 mb-4">
                Students practice triage decision-making with realistic scenarios. AI provides immediate feedback, building competency without risk to live patients. Better training today means better veterinarians tomorrow.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-700 border border-purple-200">
                <strong>🚀 Long-term Impact:</strong> Each better-trained graduate could save 50-200+ more pets over their career
              </div>
            </div>

            {/* Step 3 - Assessment & Analytics */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#5EB47C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Assessment & Analytics</h3>
              <p className="text-gray-600 mb-4">
                Track student progress with comprehensive analytics. Identify learning gaps, measure competency development, and demonstrate educational outcomes.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <strong>📊 Features:</strong> Progress tracking, competency mapping, outcome reporting
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <div className="flex justify-center mb-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Veterinary Education?</h3>
              <p className="text-lg mb-6 opacity-90">
                Join our academic beta program and get 1 full year FREE while pioneering AI-powered veterinary education
              </p>
              <div className="flex justify-center">
                <a
                  href="/contact"
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Leading Vet Schools Choose Luni Triage
            </h2>
            <p className="text-xl text-gray-600">
              Enhance your veterinary education program with AI-powered learning that meets the highest academic standards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Educational Excellence */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Excellence</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• NZVA and AVA compliant educational scenarios</li>
                <li>• Aligned with Australasian accreditation standards</li>
                <li>• Progressive difficulty levels</li>
                <li>• Evidence-based learning outcomes</li>
              </ul>
              <div className="mt-4 text-sm font-medium text-[#5EB47C]">
                95% student satisfaction rate
              </div>
            </div>

            {/* Safe Learning Environment */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe Learning Environment</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Zero risk to live patients</li>
                <li>• Mistake-based learning opportunities</li>
                <li>• Repeatable scenarios for mastery</li>
                <li>• Ethical training approach</li>
              </ul>
              <div className="mt-4 text-sm font-medium text-[#5EB47C]">
                100% patient safety guarantee
              </div>
            </div>

            {/* Faculty Support */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Faculty Support</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Comprehensive training materials</li>
                <li>• Curriculum integration guides</li>
                <li>• Assessment rubrics included</li>
                <li>• Ongoing educational support</li>
              </ul>
              <div className="mt-4 text-sm font-medium text-[#5EB47C]">
                Dedicated academic success team
              </div>
            </div>

            {/* Research Opportunities */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Research Opportunities</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Educational outcome data</li>
                <li>• Learning analytics insights</li>
                <li>• Research collaboration support</li>
                <li>• Publication opportunities</li>
              </ul>
              <div className="mt-4 text-sm font-medium text-[#5EB47C]">
                Data for educational research
              </div>
            </div>

            {/* Scalable Platform */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scalable Platform</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Unlimited student access</li>
                <li>• Multi-campus deployment</li>
                <li>• White-label options available</li>
                <li>• Integration with LMS systems</li>
              </ul>
              <div className="mt-4 text-sm font-medium text-[#5EB47C]">
                Grows with your program
              </div>
            </div>

            {/* Cost Effective */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cost Effective</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Reduce live animal training costs</li>
                <li>• Minimize facility requirements</li>
                <li>• Academic pricing available</li>
                <li>• High student-to-instructor ratios</li>
              </ul>
              <div className="mt-4 text-sm font-medium text-[#5EB47C]">
                50% reduction in training costs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Pricing Section */}
      <div id="academic-pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Academic Pricing Plans
            </h2>
            <p className="text-xl text-gray-600">
              Flexible pricing designed for veterinary schools and educational institutions
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
              <p className="text-green-800 font-medium">
                🎓 <strong>Academic Partners:</strong> Get your first year completely FREE when you join our beta program!
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Academic Enterprise/Custom Only */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#5EB47C] p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Academic Enterprise</h3>
                <p className="text-gray-600 mb-4">Custom pricing for veterinary schools & educational institutions</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited student accounts
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom curriculum integration & scenarios
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete faculty training program
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multi-campus deployment & LMS integration
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Research collaboration & publication support
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated academic success manager & SLA
                </li>
              </ul>
              
              <a
                href="/contact"
                className="block w-full bg-[#5EB47C] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#4A9A64] transition-colors text-center"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Beta Program Invitation */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Academic Beta Program
            </h2>
            <p className="text-xl text-gray-600">
              Be among the first veterinary schools in NZ and AU to revolutionize veterinary education with AI
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-2xl p-8 text-white mb-12">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Academic Partner Benefits</h3>
              <p className="text-lg opacity-90">
                Shape the future of veterinary education while gaining exclusive advantages
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">🆓</div>
                <h4 className="font-semibold mb-2">Free for 1 Full Year</h4>
                <p className="text-sm opacity-90">Complete platform access for 12 months at no cost</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">📚</div>
                <h4 className="font-semibold mb-2">Custom Curriculum Integration</h4>
                <p className="text-sm opacity-90">We'll adapt scenarios to your specific course requirements</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">🏫</div>
                <h4 className="font-semibold mb-2">Faculty Training Program</h4>
                <p className="text-sm opacity-90">Comprehensive training for all teaching staff included</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">🔬</div>
                <h4 className="font-semibold mb-2">Research Collaboration</h4>
                <p className="text-sm opacity-90">Co-author papers on AI in veterinary education</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-semibold mb-2">Product Development Input</h4>
                <p className="text-sm opacity-90">Your feedback directly influences educational features</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">🌟</div>
                <h4 className="font-semibold mb-2">Founding Partner Status</h4>
                <p className="text-sm opacity-90">Recognition as an educational innovation leader</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Academic Partnership Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Ideal Academic Partners:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">✓</span>
                    Accredited veterinary schools in NZ or AU
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">✓</span>
                    Programs with 50+ veterinary students
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">✓</span>
                    Forward-thinking educational institutions
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">✓</span>
                    Interest in educational technology research
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Partnership Commitment:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">•</span>
                    6-month pilot program with one course
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">•</span>
                    Monthly feedback sessions with faculty
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">•</span>
                    Student outcome data sharing (anonymized)
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#5EB47C] mr-2">•</span>
                    Case study development collaboration
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h4 className="font-semibold text-gray-900 mb-3">Research Opportunities:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Educational Outcomes Research:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Learning effectiveness studies</li>
                    <li>• Student confidence metrics</li>
                    <li>• Knowledge retention analysis</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Technology Integration Studies:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• AI acceptance in veterinary education</li>
                    <li>• Curriculum integration best practices</li>
                    <li>• Faculty adoption strategies</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <a
                href="/contact"
                className="bg-[#5EB47C] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#4A9A64] transition-colors"
              >
                Apply for Academic Partnership
              </a>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Rolling admissions • Free pilot program • Custom implementation timeline
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                How does Luni Triage align with veterinary education standards?
              </h3>
              <p className="text-gray-700">
                Luni Triage is developed in compliance with NZVA (New Zealand Veterinary Association) and 
                AVA (Australian Veterinary Association) educational standards. Our educational scenarios are 
                reviewed by qualified veterinary educators and align with Australasian accreditation requirements 
                for clinical competency training.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can we integrate this with our existing Learning Management System?
              </h3>
              <p className="text-gray-700">
                Yes! Luni Triage supports integration with popular LMS platforms including Moodle, Canvas, 
                and Blackboard. We provide API documentation and technical support to ensure seamless 
                integration with your existing educational infrastructure.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What kind of analytics and reporting do you provide for educators?
              </h3>
              <p className="text-gray-700">
                Our platform provides comprehensive analytics including student progress tracking, competency 
                mapping, time-to-completion metrics, and detailed performance reports. Educators can identify 
                learning gaps, track improvement over time, and demonstrate educational outcomes for accreditation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there support for research and publication opportunities?
              </h3>
              <p className="text-gray-700">
                Absolutely! We provide anonymized educational data for research purposes and support faculty 
                in educational research projects. Many institutions have published papers on learning outcomes 
                using our platform, and we offer research collaboration opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Veterinary Program?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join leading veterinary schools preparing the next generation of veterinarians with AI-powered education
          </p>
          <div className="flex justify-center">
            <a
              href="/contact"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Free pilot program • Faculty training included • Research collaboration opportunities
          </p>
        </div>
      </div>
    </div>
  );
};

export default VetSchoolsPage;