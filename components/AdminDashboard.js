import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { showError, showSuccess } = useNotificationContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);

  const [qualificationSubmissions, setQualificationSubmissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    petOwners: 0,
    verifiedProviders: 0,
    pendingProviders: 0,
    pendingQualifications: 0,
    admins: 0,
    support: 0,
    totalBookings: 0,
    providersByType: {}
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const checkAdminAccess = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        showError('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setCurrentUser(profile);
    } catch (error) {
      showError('An error occurred while checking access. Please try again.');
      navigate('/signin');
    }
  }, [navigate, showError]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Use Promise.all for parallel queries - performance optimization
      const [usersResponse, providersResponse, userCountResponse, providerCountResponse, qualificationsResponse, bookingCountResponse] = await Promise.all([
        // Load users with specific fields to reduce payload
        supabase
          .from('profiles')
          .select('id, email, role, created_at, updated_at, full_name')
          .order('created_at', { ascending: false })
          .limit(50),
        
        // Load all providers from providers table
        supabase
          .from('providers')
          .select('id, name, email, provider_type, city, country, created_at, verified, rating, reviews_count, is_active')
          .order('created_at', { ascending: false })
          .limit(50),
        
        // Get all profiles to count by role
        supabase
          .from('profiles')
          .select('role'),
        
        // Get all providers to count by type and status
        supabase
          .from('providers')
          .select('provider_type, verified, is_active'),
        
        // Load qualification submissions
        supabase
          .from('provider_qualifications')
          .select('*')
          .order('submitted_at', { ascending: false })
          .limit(50),

        supabase
          .from('consultation_bookings')
          .select('*', { count: 'estimated', head: true })
      ]);

      // Extract data and counts
      const usersData = usersResponse.data || [];
      const providersData = providersResponse.data || [];
      const qualificationsData = qualificationsResponse.data || [];
      const roleData = userCountResponse.data || [];
      const allProvidersData = providerCountResponse.data || [];
      const bookingCountData = bookingCountResponse;

      // Count users by role from profiles
      const roleCounts = roleData.reduce((acc, user) => {
        const role = user.role || 'pet_owner';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      // Count providers by type and status
      const verifiedProviders = allProvidersData.filter(p => p.verified);
      const pendingProviders = allProvidersData.filter(p => !p.verified);
      
      const providersByType = allProvidersData.reduce((acc, provider) => {
        const type = provider.provider_type || 'Unknown';
        if (!acc[type]) {
          acc[type] = { total: 0, verified: 0, pending: 0 };
        }
        acc[type].total++;
        if (provider.verified) {
          acc[type].verified++;
        } else {
          acc[type].pending++;
        }
        return acc;
      }, {});

      setUsers(usersData);
      setProviders(providersData);
      setQualificationSubmissions(qualificationsData);
      setAuditLogs([]); // Audit logs table does not exist
      setStats({
        petOwners: roleCounts.pet_owner || 0,
        verifiedProviders: verifiedProviders.length,
        unverifiedProviders: pendingProviders.length,
        pendingQualifications: qualificationsData.filter(q => q.status === 'pending').length,
        admins: roleCounts.admin || 0,
        support: roleCounts.support || 0,
        totalBookings: bookingCountData.count || 0,
        providersByType
      });

    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadDashboardData();
    }
  }, [currentUser, loadDashboardData]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      showSuccess(`User role updated to ${newRole}`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      showError('Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: !currentStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;

      showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadDashboardData();
    } catch (error) {
      showError('Failed to update user status');
    }
  };



  const approveQualification = async (qualificationId) => {
    try {
      // Update qualification status
      const { data: updatedQualification, error: qualError } = await supabase
        .from('provider_qualifications')
        .update({ 
          status: 'approved',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', qualificationId)
        .select()
        .single();

      if (qualError) throw qualError;

      // Update provider verification status
      const { error: providerError } = await supabase
        .from('providers')
        .update({ verified: true })
        .eq('id', updatedQualification.provider_id);

      if (providerError) throw providerError;

      // Update local state
      setQualificationSubmissions(qualificationSubmissions.map(qual => 
        qual.id === qualificationId ? { ...qual, status: 'approved' } : qual
      ));

      showSuccess('Qualification approved! Provider now has full access.');
      
      // Reload dashboard data to update stats
      loadDashboardData();
    } catch (error) {
      showError('Failed to approve qualification');
    }
  };

  const rejectQualification = async (qualificationId, reason = '') => {
    try {
      const { error } = await supabase
        .from('provider_qualifications')
        .update({ 
          status: 'rejected',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reason
        })
        .eq('id', qualificationId);

      if (error) throw error;

      // Update local state
      setQualificationSubmissions(qualificationSubmissions.map(qual => 
        qual.id === qualificationId ? { ...qual, status: 'rejected' } : qual
      ));

      showSuccess('Qualification rejected. Provider will be notified.');
    } catch (error) {
      showError('Failed to reject qualification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/admin.svg" 
                alt="Admin" 
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-md font-medium text-gray-900 truncate">Admin</h4>
                <p className="text-sm text-gray-600 truncate">{currentUser?.full_name}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5EB47C] text-white">
              Administrator
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-2 py-2">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {[
              { 
                id: 'overview', 
                name: 'Overview', 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                )
              },
              { 
                id: 'users', 
                name: 'Users', 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )
              },
              { 
                id: 'providers', 
                name: 'Providers', 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                )
              },
              { 
                id: 'qualifications', 
                name: 'Qualifications', 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                )
              },
              { 
                id: 'audit', 
                name: 'Audit', 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )
              }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-green-100 text-[#5EB47C]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="w-4 h-4 mr-2">{item.icon}</div>
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
                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/admin.svg" 
                  alt="Admin" 
                  className="w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">Admin</h1>
                  <p className="text-sm text-gray-600 truncate">{currentUser?.full_name}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {[
                { 
                  id: 'overview', 
                  name: 'System Overview', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  )
                },
                { 
                  id: 'users', 
                  name: 'User Management', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )
                },
                { 
                  id: 'providers', 
                  name: 'All Providers', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  )
                },
                { 
                  id: 'qualifications', 
                  name: 'Qualifications', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                  )
                },
                { 
                  id: 'audit', 
                  name: 'Audit Logs', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )
                }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-100 text-[#5EB47C]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-5 h-5 mr-3">{item.icon}</div>
                  {item.name}
                  {item.id === 'qualifications' && stats.pendingQualifications > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {stats.pendingQualifications}
                    </span>
                  )}
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

  function renderActiveSection() {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                              <h1 className="text-2xl font-bold mb-2 text-gray-900">
                  {currentUser?.full_name}
                </h1>
              <p className="text-gray-600">
                You have {stats.pendingQualifications} pending qualifications and {stats.unverifiedProviders} providers awaiting approval.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Pet Owners</h3>
                  <p className="text-2xl font-bold text-[#5EB47C]">{stats.petOwners}</p>
                  <p className="text-xs text-gray-400 mt-1">Active customers</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Verified Providers</h3>
                  <p className="text-2xl font-bold text-[#5EB47C]">{stats.verifiedProviders}</p>
                  <p className="text-xs text-gray-400 mt-1">Approved & active</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 border-l-4 border-l-orange-400">
                  <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.unverifiedProviders}</p>
                  <p className="text-xs text-gray-400 mt-1">Provider accounts</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 border-l-4 border-l-blue-400">
                  <h3 className="text-sm font-medium text-gray-500">Qualifications</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.pendingQualifications}</p>
                  <p className="text-xs text-gray-400 mt-1">Pending review</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.admins + stats.support}</p>
                  <p className="text-xs text-gray-400 mt-1">Admins & support</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'providers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">All Providers</h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#5EB47C]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {providers.map((provider) => (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                              <div className="text-sm text-gray-500">{provider.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {provider.provider_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {provider.city}, {provider.country}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(provider.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {provider.rating ? `${provider.rating}/5` : 'No ratings'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">User Management</h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#5EB47C]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pet_owner">Pet Owner</option>
                              <option value="provider">Provider</option>
                              <option value="admin">Admin</option>
                              <option value="support">Support</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className="text-[#5EB47C] hover:text-[#4A9A64] mr-3"
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'qualifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Qualification Submissions</h2>
              
              {qualificationSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Qualification Submissions</h3>
                  <p className="text-gray-600">Qualification submissions will appear here for review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qualificationSubmissions.map((qualification) => (
                    <div key={qualification.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {qualification.provider_name}
                          </h3>
                          <p className="text-sm text-gray-600">{qualification.provider_email}</p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              qualification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              qualification.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {qualification.status.charAt(0).toUpperCase() + qualification.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {qualification.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveQualification(qualification.id)}
                              className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] text-sm font-medium"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectQualification(qualification.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );


      case 'audit':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Logs</h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#5EB47C]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.action || log.event_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.resource_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.user_id || 'System'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {log.details ? JSON.stringify(log.details) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900">Select a section from the sidebar</h2>
            </div>
          </div>
        );
    }
  }
};

export default AdminDashboard;
