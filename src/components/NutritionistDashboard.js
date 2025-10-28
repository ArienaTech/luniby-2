import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

// Nutritionist components matching breeder/trainer UI structure
const NutritionistOverview = ({ user, profile }) => {
  const stats = {
    activeClients: 24,
    nutritionPlans: 18,
    consultations: 32,
    successRate: 94
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Professional Nutritionist'}
        </h1>
        <p className="text-gray-600">
          You have {stats.consultations} consultations this month and {stats.activeClients} active nutrition plans.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Active Clients</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.activeClients}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
                <span className="text-lg sm:text-xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-xs sm:text-sm font-medium">Nutrition Plans</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.nutritionPlans}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
                <span className="text-lg sm:text-xl">🥗</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-xs sm:text-sm font-medium">Consultations</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.consultations}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600">
                <span className="text-lg sm:text-xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-xs sm:text-sm font-medium">Success Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-900">{stats.successRate}%</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600">
                <span className="text-lg sm:text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Consultations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Consultations */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Today's Consultations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">M</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Max - Weight Management</p>
                  <p className="text-sm text-gray-600">10:00 AM • Golden Retriever • Overweight</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">Confirmed</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">L</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Luna - Puppy Nutrition</p>
                  <p className="text-sm text-gray-600">2:00 PM • Labrador • 4 months old</p>
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">Pending</span>
                </div>
              </div>
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
                <span className="text-green-500 text-lg">🥗</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created meal plan for Charlie</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-lg">📅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">New consultation booking accepted</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-purple-500 text-lg">💬</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Message from Sarah about Max's progress</p>
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

const NutritionMarketplace = ({ user, profile }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadNutritionJobs();
  }, []);

  const loadNutritionJobs = async () => {
    try {
      // For now, we'll show empty state since nutrition consultation jobs aren't implemented yet
      // In the future, this would fetch from a nutrition_jobs or marketplace API
      setJobs([]);
    } catch (error) {
      console.error('Error loading nutrition jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Consultations</h1>
        <p className="text-gray-600">Browse and accept available nutrition consultation requests</p>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultations...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.pet_name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full w-fit mt-1 sm:mt-0">
                      {job.service_type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">{job.description}</p>
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
                    <span>📍 {job.location}</span>
                    <span>📅 {job.scheduled_date}</span>
                    <span>🕐 {job.scheduled_time}</span>
                    <span>👤 {job.owner_name}</span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">${job.price}</div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors">
                    Accept Consultation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NutritionPlans = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nutrition Plans</h1>
        <p className="text-gray-600">Manage nutrition plans for your marketplace clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Plans */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Plans</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">M</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Max - Weight Loss Plan</p>
                  <p className="text-sm text-gray-600">Golden Retriever • Target: -5kg • Week 3/12</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">On track</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">L</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Luna - Puppy Growth Plan</p>
                  <p className="text-sm text-gray-600">Labrador • 4 months • Growth phase</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">New plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Templates */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Plan Templates</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold text-sm">🏃</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Weight Management</p>
                  <p className="text-sm text-gray-600">For overweight dogs and cats</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">🐾</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Puppy Growth</p>
                  <p className="text-sm text-gray-600">For growing puppies 2-12 months</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NutritionConsultations = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
        <p className="text-gray-600">Manage your scheduled nutrition consultations</p>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Consultation Management Coming Soon</h3>
        <p className="text-gray-600">
          View and manage nutrition consultations you've accepted from the marketplace. Track appointments, client progress, and follow-up schedules.
        </p>
      </div>
    </div>
  );
};

const NutritionistMessages = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with your nutrition clients</p>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Messaging System Coming Soon</h3>
        <p className="text-gray-600">
          Chat directly with pet owners who book your nutrition services. Share meal plans, answer questions, and provide ongoing support.
        </p>
      </div>
    </div>
  );
};

const NutritionistAnalytics = ({ user, profile }) => {
  const analyticsData = {
    totalClients: 45,
    plansCreated: 67,
    avgImprovement: 85,
    clientRetention: 92
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600">View your nutrition practice performance and insights</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.totalClients}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
              <span className="text-lg sm:text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Plans Created</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.plansCreated}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
              <span className="text-lg sm:text-xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Improvement</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.avgImprovement}%</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600">
              <span className="text-lg sm:text-xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Client Retention</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.clientRetention}%</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600">
              <span className="text-lg sm:text-xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Progress Overview</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">Advanced analytics charts coming soon</p>
        </div>
      </div>
    </div>
  );
};

const NutritionistProfile = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nutritionist Profile</h1>
        <p className="text-gray-600">Manage your professional information and certifications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          {/* Profile Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name</label>
                <input 
                  type="text" 
                  defaultValue="Healthy Paws Nutrition"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input 
                  type="number" 
                  defaultValue="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input 
                  type="text" 
                  defaultValue="Weight Management, Senior Pet Nutrition"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Qualifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Certified Pet Nutritionist</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Animal Nutrition Degree</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Continuing Education Credits</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Due Soon</span>
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

const NutritionistDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  // Nutritionist navigation matching breeder/trainer structure
  const nutritionistNavigation = [
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
      id: 'marketplace', 
      name: 'Marketplace',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      id: 'plans', 
      name: 'Nutrition Plans',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'consultations', 
      name: 'Consultations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      console.log('NutritionistDashboard - Current user:', currentUser);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error getting profile:', profileError);
        console.log('NutritionistDashboard - No profile found, using basic user data');
      } else {
        console.log('NutritionistDashboard - Profile loaded:', profileData);
        setProfile(profileData);
        console.log('✅ NutritionistDashboard - Profile loaded successfully');
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
        return <NutritionistOverview user={user} profile={profile} />;
      case 'marketplace':
        return <NutritionMarketplace user={user} profile={profile} />;
      case 'plans':
        return <NutritionPlans user={user} profile={profile} />;
      case 'consultations':
        return <NutritionConsultations user={user} profile={profile} />;
      case 'messages':
        return <NutritionistMessages user={user} profile={profile} />;
      case 'analytics':
        return <NutritionistAnalytics user={user} profile={profile} />;
      case 'profile':
        return <NutritionistProfile user={user} profile={profile} />;
      default:
        return <NutritionistOverview user={user} profile={profile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your nutritionist dashboard...</p>
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
                     'Nutritionist';
  
  const firstName = displayName.split(' ')[0] || 'Nutritionist';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/nutritionist.svg" 
                alt="Nutritionist" 
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-md font-medium text-gray-900 truncate">Welcome back, {firstName}</h4>
                <p className="text-sm text-gray-600 truncate">Pet Nutritionist</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-2 py-2">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {nutritionistNavigation.map((item) => (
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
                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/nutritionist.svg" 
                  alt="Nutritionist" 
                  className="w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">Pet Nutritionist</h1>
                  <p className="text-sm text-gray-600 truncate">{displayName}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {nutritionistNavigation.map((item) => (
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

export default NutritionistDashboard;