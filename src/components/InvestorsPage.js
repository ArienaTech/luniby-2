import React from 'react';

const InvestorsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Investors
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join us in revolutionizing veterinary care with AI technology that saves lives, 
              improves outcomes, and transforms education across a $427 billion global market.
            </p>
          </div>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Market Opportunity</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The global veterinary software market is experiencing unprecedented growth, 
              driven by increasing pet ownership and demand for advanced healthcare solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">$259B</div>
              <p className="text-gray-600">Global Pet Care Market (2024)</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">$427B</div>
              <p className="text-gray-600">Projected by 2032</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">30K+</div>
              <p className="text-gray-600">Vet Clinics in AU/NZ</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
              <p className="text-gray-600">Vet Schools in Region</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Potential */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Impact Potential</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Luni Triage isn't just improving efficiency—it's saving lives at scale through better decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pet Owners Impact */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Pet Owners</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Monthly users (projected):</span>
                  <span className="font-semibold">10,000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency detection improvement:</span>
                  <span className="font-semibold">0.5%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Pets saved annually:</span>
                  <span className="font-semibold text-green-600">600+</span>
                </div>
              </div>
            </div>

            {/* Clinics Impact */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Veterinary Clinics</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Cases per clinic daily:</span>
                  <span className="font-semibold">100</span>
                </div>
                <div className="flex justify-between">
                  <span>Triage accuracy improvement:</span>
                  <span className="font-semibold">1%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Better outcomes per clinic/year:</span>
                  <span className="font-semibold text-green-600">365+</span>
                </div>
              </div>
            </div>

            {/* Vet Schools Impact */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Vet Schools</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Students per graduating class:</span>
                  <span className="font-semibold">100</span>
                </div>
                <div className="flex justify-between">
                  <span>Pets per vet career:</span>
                  <span className="font-semibold">5,000-10,000</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Pets saved per class:</span>
                  <span className="font-semibold text-green-600">5,000+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compound Impact */}
          <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Compound Impact Over 10 Years</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <p className="opacity-90">Pets saved through better vet training</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">6,000+</div>
                <p className="opacity-90">Direct pet owner emergency detections</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">36,500+</div>
                <p className="opacity-90">Improved clinic outcomes</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="text-5xl font-bold mb-2">90,000+</div>
              <p className="text-xl opacity-90">Total Pets' Lives Improved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Expansion Strategy */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Global Expansion Strategy</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Starting in Australia and New Zealand, with planned expansion to major English-speaking markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Phase 1: AU/NZ */}
            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🇦🇺</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phase 1: AU/NZ</h3>
                <div className="text-2xl font-bold text-green-600 mb-2">$8B</div>
                <p className="text-gray-600 text-sm">Market Size</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Current Focus</p>
                  <p>2024-2025</p>
                </div>
              </div>
            </div>

            {/* Phase 2: UK */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🇬🇧</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phase 2: UK</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">$12B</div>
                <p className="text-gray-600 text-sm">Market Size</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>📋 Planned</p>
                  <p>2026-2027</p>
                </div>
              </div>
            </div>

            {/* Phase 3: US */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🇺🇸</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phase 3: US</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">$87B</div>
                <p className="text-gray-600 text-sm">Market Size</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>🚀 Target</p>
                  <p>2027-2028</p>
                </div>
              </div>
            </div>

            {/* Phase 4: Global */}
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phase 4: Global</h3>
                <div className="text-2xl font-bold text-orange-600 mb-2">$427B</div>
                <p className="text-gray-600 text-sm">Total Addressable Market</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>🌟 Vision</p>
                  <p>2028+</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">Expansion Advantages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">🌐</span>
                  English-Speaking Markets First
                </h4>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    Similar veterinary education standards
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    Comparable regulatory frameworks
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    No language/cultural barriers
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    Established professional networks
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">⚡</span>
                  Scalable Technology
                </h4>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    Cloud-native architecture
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    Multi-language AI capability
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    Regulatory compliance framework
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    Partner network model
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Model */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Revenue Streams</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">B2C: Pet Owners</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• <strong>Freemium Model:</strong> Basic AI triage free, premium features $9.99/month</li>
                <li>• <strong>Marketplace Commission:</strong> 10-15% on vet consultations and services</li>
                <li>• <strong>Projected ARR:</strong> $2-5M from consumer subscriptions</li>
                <li>• <strong>Market Size:</strong> 15M+ pets in AU/NZ</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">B2B: Enterprise</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• <strong>Clinic Subscriptions:</strong> $299-699/month per practice</li>
                <li>• <strong>Academic Licenses:</strong> $199-499/month per school</li>
                <li>• <strong>Enterprise Contracts:</strong> Custom pricing for large organizations</li>
                <li>• <strong>Projected ARR:</strong> $5-15M from enterprise clients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Capital Efficiency */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Exceptional Capital Efficiency</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-bold mb-2">&lt; $1,000</div>
                <p className="opacity-90">Total Investment to Date</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">$427B</div>
                <p className="opacity-90">Total Addressable Market</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">427,000x</div>
                <p className="opacity-90">Market Opportunity vs Investment</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">What We've Built for Under $1,000:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p>✅ Advanced 7-criteria AI triage system</p>
                  <p>✅ Multi-audience platform (B2C + B2B + Education)</p>
                  <p>✅ Professional SOAP note generation</p>
                  <p>✅ Streaming AI responses (60-80% faster)</p>
                </div>
                <div className="text-left">
                  <p>✅ NZVA/AVA compliant educational scenarios</p>
                  <p>✅ Enterprise-ready API architecture</p>
                  <p>✅ Complete marketplace integration</p>
                  <p>✅ Comprehensive beta program framework</p>
                </div>
              </div>
              <p className="mt-4 text-sm opacity-90 font-medium">
                Investment breakdown: Business registration, development subscriptions, and domain costs only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Advantage */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We're 3-5 Years Ahead</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Innovation</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 7-criteria AI triage system (vs. 3-4 in competitors)</li>
                <li>• 60-80% faster response times through streaming</li>
                <li>• Professional SOAP note generation</li>
                <li>• Multi-modal analysis (text + image)</li>
                <li>• NZVA/AVA compliance built-in</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Position</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• First to combine B2C, B2B, and educational markets</li>
                <li>• Educational platform creates defensible moat</li>
                <li>• Network effects: more users = better AI</li>
                <li>• Early mover advantage in AU/NZ market</li>
                <li>• Veterinary expert advisory board</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Opportunity */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Ready to Save Lives and Generate Returns?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join us in building the future of veterinary care. We're seeking strategic investors 
            who share our vision of using AI to save pets' lives while building a profitable, 
            scalable business.
          </p>
          <div className="flex justify-center">
            <a
              href="/contact"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Investment Inquiry
            </a>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Seeking seed funding • Built with &lt; $1,000 • Ready to scale
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestorsPage;