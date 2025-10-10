import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

// Breeder components matching trainer UI structure
const BreederOverview = ({ user, profile }) => {
  const stats = {
    activeDogs: 8,
    currentLitters: 3,
    waitingList: 12,
    healthCertifications: 100
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Professional Breeder'}
        </h1>
        <p className="text-gray-600">
          You have {stats.currentLitters} active litters and {stats.waitingList} families on your waiting list.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Breeding Dogs</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.activeDogs}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
                <span className="text-lg sm:text-xl">🐕</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-xs sm:text-sm font-medium">Current Litters</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.currentLitters}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
                <span className="text-lg sm:text-xl">🐾</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-xs sm:text-sm font-medium">Waiting List</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.waitingList}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600">
                <span className="text-lg sm:text-xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-xs sm:text-sm font-medium">Health Certifications</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-900">{stats.healthCertifications}%</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600">
                <span className="text-lg sm:text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Litters & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Litters */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Litters</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🐕</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No litters yet</h4>
              <p className="text-gray-600 text-sm">
                Your litters and breeding information will appear here
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-lg">🐾</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bella's litter health check completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-lg">📋</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">New family added to waiting list</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-purple-500 text-lg">💬</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Message from Johnson family about puppy availability</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BreederLitters = ({ user, profile }) => {
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadLitters();
  }, [user]);

  const loadLitters = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // For now, show empty state since litters system isn't implemented yet
      // In the future, this would fetch from a litters database table
      setLitters([]);
    } catch (error) {
      console.error('Error loading litters:', error);
      setLitters([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Litters</h1>
        <p className="text-gray-600">Manage litters available on the marketplace</p>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading litters...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {litters.map((litter) => (
            <div key={litter.id} className="bg-white border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{litter.dam_name} x {litter.sire_name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full w-fit mt-1 sm:mt-0 ${
                      litter.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {litter.available_puppies} available
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">{litter.breed} • {litter.puppy_count} puppies</p>
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
                    <span>📅 Born: {litter.birth_date}</span>
                    <span>🏠 Ready: {litter.ready_date}</span>
                    <span>💰 ${litter.price_range}</span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <button className="w-full sm:w-auto px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors mb-2">
                    Manage Litter
                  </button>
                  <div className="text-sm text-gray-500">
                    {litter.available_puppies} of {litter.puppy_count} available
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BreedingProgram = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Breeding Program</h1>
        <p className="text-gray-600">Plan and manage your breeding schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breeding Schedule */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Breeding Schedule</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📅</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No breeding plans yet</h4>
              <p className="text-gray-600 text-sm">
                Your upcoming breeding schedule will appear here
              </p>
            </div>
          </div>
        </div>

        {/* Breeding Dogs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Breeding Dogs</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-pink-50 rounded-lg">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-semibold text-sm">♀</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Bella</p>
                  <p className="text-sm text-gray-600">3 years • Golden Retriever • Dam</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">Healthy</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">♂</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Champion Duke</p>
                  <p className="text-sm text-gray-600">4 years • Golden Retriever • Sire</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">Champion bloodline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthRecords = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
        <p className="text-gray-600">Track health testing and certifications for your breeding dogs</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Health Testing Status</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">B</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bella</p>
                  <p className="text-sm text-gray-600">Hip/Elbow: Clear • Eyes: Clear • Heart: Clear</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">All Clear</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold text-sm">L</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Luna</p>
                  <p className="text-sm text-gray-600">Hip/Elbow: Clear • Eyes: Pending • Heart: Clear</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Testing Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientManagement = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Clients</h1>
          <p className="text-gray-600">Manage clients from marketplace bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting List from Marketplace */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Interested Families</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h4>
              <p className="text-gray-600 text-sm">
                Families interested in your litters will appear here
              </p>
            </div>
          </div>
        </div>

        {/* Current Marketplace Bookings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h4>
              <p className="text-gray-600 text-sm">
                Active puppy reservations and bookings will appear here
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

const BreederMessages = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with potential and current puppy buyers</p>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Messaging System Coming Soon</h3>
        <p className="text-gray-600">
          Chat directly with families interested in your puppies. Answer questions about litters, coordinate visits, and manage the adoption process.
        </p>
      </div>
    </div>
  );
};

const BreederAnalytics = ({ user, profile }) => {
  const analyticsData = {
    totalLitters: 15,
    puppiesSold: 89,
    averagePrice: 1350,
    clientSatisfaction: 4.9
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600">View your breeding program performance and insights</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Litters</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.totalLitters}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
              <span className="text-lg sm:text-xl">🐾</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Puppies Sold</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.puppiesSold}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
              <span className="text-lg sm:text-xl">🏠</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${analyticsData.averagePrice}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600">
              <span className="text-lg sm:text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.clientSatisfaction}⭐</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600">
              <span className="text-lg sm:text-xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breeding Performance</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">Advanced analytics charts coming soon</p>
        </div>
      </div>
    </div>
  );
};

const BreederProfile = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Breeder Profile</h1>
        <p className="text-gray-600">Manage your breeder information and certifications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          {/* Profile Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Breeder Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kennel Name</label>
                <input 
                  type="text" 
                  defaultValue="Golden Dreams Kennel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input 
                  type="number" 
                  defaultValue="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Breed</label>
                <input 
                  type="text" 
                  defaultValue="Golden Retriever"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input 
                  type="text" 
                  defaultValue="Auckland, New Zealand"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Memberships</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Kennel Club Registration</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Breeding Ethics Certification</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Certified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Health Testing Certification</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Renewal Due</span>
              </div>
            </div>
          </div>

          <button className="w-full sm:w-auto px-6 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const BreederDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  // Breeder navigation matching trainer structure
  const breederNavigation = [
    { 
      id: 'overview', 
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      )
    },
    { 
      id: 'litters', 
      name: 'Litters',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: 'breeding', 
      name: 'Breeding Program',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'health', 
      name: 'Health Records',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'clients', 
      name: 'Clients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'messages', 
      name: 'Messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      id: 'analytics', 
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      name: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setError('Error loading user data');
        setLoading(false);
        return;
      }

      if (!currentUser) {
        console.log('No user found, redirecting to sign in');
        navigate('/signin');
        return;
      }

      setUser(currentUser);
      console.log('BreederDashboard - Current user:', currentUser);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error getting profile:', profileError);
        console.log('BreederDashboard - No profile found, using basic user data');
      } else {
        console.log('BreederDashboard - Profile loaded:', profileData);
        setProfile(profileData);
        console.log('✅ BreederDashboard - Profile loaded successfully');
      }

      setLoading(false);

    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setError('Error loading dashboard data');
      setLoading(false);
    }
  };

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <BreederOverview user={user} profile={profile} />;
      case 'litters':
        return <BreederLitters user={user} profile={profile} />;
      case 'breeding':
        return <BreedingProgram user={user} profile={profile} />;
      case 'health':
        return <HealthRecords user={user} profile={profile} />;
      case 'clients':
        return <ClientManagement user={user} profile={profile} />;
      case 'messages':
        return <BreederMessages user={user} profile={profile} />;
      case 'analytics':
        return <BreederAnalytics user={user} profile={profile} />;
      case 'profile':
        return <BreederProfile user={user} profile={profile} />;
      default:
        return <BreederOverview user={user} profile={profile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your breeder dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 font-montserrat">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#5EB47C] text-white rounded hover:bg-[#4A9B63]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get display name from profile or user data
  const displayName = profile?.full_name || 
                     (user?.user_metadata?.full_name) ||
                     (user?.email?.split('@')[0]) ||
                     'Breeder';
  
  const firstName = displayName.split(' ')[0] || 'Breeder';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/breeder.svg" 
                alt="Breeder" 
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-md font-medium text-gray-900 truncate">Welcome back, {firstName}</h4>
                <p className="text-sm text-gray-600 truncate">Professional Breeder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-2 py-2">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {breederNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-shrink-0 flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-green-100 text-[#5EB47C]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/breeder.svg" 
                  alt="Breeder" 
                  className="w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">Pet Breeder</h1>
                  <p className="text-sm text-gray-600 truncate">{displayName}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {breederNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'bg-green-100 text-[#5EB47C]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default BreederDashboard;