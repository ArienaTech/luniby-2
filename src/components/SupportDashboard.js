import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useNotificationContext } from '../contexts/NotificationContext';
import * as Sentry from '@sentry/react';

const SupportDashboard = () => {
  const { showInfo } = useNotificationContext();
  const [profile, setProfile] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProviders: 0,
    recentIssues: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData || profileData.role !== 'support') {
        navigate('/');
        return;
      }

      setProfile(profileData);

      // Load recent users (for support assistance)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentUsers(usersData || []);

      // Load recent bookings (for support monitoring)
      const { data: bookingsData } = await supabase
        .from('consultation_bookings')
        .select(`
          *,
          provider_listings (
            title,
            provider_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      setRecentBookings(bookingsData || []);

      // Load recent audit logs (for troubleshooting)
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setAuditLogs(auditData || []);

      // Calculate stats
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: providerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'provider');

      const recentIssues = (auditData || []).filter(log => 
        log.action.includes('error') || log.action.includes('failed')
      ).length;

      setStats({
        totalUsers: userCount || 0,
        activeProviders: providerCount || 0,
        recentIssues,
        systemHealth: recentIssues > 5 ? 'degraded' : 'healthy'
      });

    } catch (error) {
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-[#E5F4F1] text-[#4A9A64]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'provider': return 'bg-[#E5F4F1] text-[#4A9A64]';
      case 'pet_owner': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityAction = (action) => {
    const actionMap = {
      'account_created': 'Account created',
      'profile_updated': 'Profile updated',
      'booking_created': 'New booking made',
      'booking_cancelled': 'Booking cancelled',
      'data_exported': 'Data exported',
      'login': 'User signed in',
      'error_occurred': 'System error',
      'rate_limit_exceeded': 'Rate limit hit'
    };
    return actionMap[action] || action.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
              <p className="text-gray-600">Welcome, {profile?.full_name || 'Support Team'}!</p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/admin"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Admin Panel
              </Link>
              <Link
                to="/marketplace"
                className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64]"
              >
                View Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Providers</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.activeProviders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Issues</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.recentIssues}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">System Health</h3>
            <p className={`text-3xl font-bold ${
              stats.systemHealth === 'healthy' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {stats.systemHealth === 'healthy' ? '✓ Healthy' : '⚠ Degraded'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
            </div>
            <div className="p-6">
              {recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.slice(0, 8).map((user) => (
                    <div key={user.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.full_name || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role === 'pet_owner' ? 'Pet Owner' : user.role}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
            </div>
            <div className="p-6">
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.slice(0, 8).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {booking.provider_listings?.title || 'Service Booking'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Provider: {booking.provider_listings?.provider_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.consultation_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No bookings found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Support Tools</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">👑</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-500">Full admin access</p>
                </div>
              </Link>

              <button
                onClick={() => showInfo('Feature coming soon: User lookup and assistance')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-[#E5F4F1] rounded-lg flex items-center justify-center">
              <span className="text-[#5EB47C] text-sm">🔍</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">User Lookup</h3>
                  <p className="text-sm text-gray-500">Find user accounts</p>
                </div>
              </button>

              <button
                onClick={() => showInfo('Feature coming soon: Booking management tools')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Booking Support</h3>
                  <p className="text-sm text-gray-500">Manage bookings</p>
                </div>
              </button>

              <button
                onClick={() => showInfo('Feature coming soon: System diagnostics')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-sm">🔧</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Diagnostics</h3>
                  <p className="text-sm text-gray-500">System health</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity / Audit Logs */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent System Activity</h2>
          </div>
          <div className="p-6">
            {auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${
                        log.action.includes('error') || log.action.includes('failed') 
                          ? 'bg-red-400' 
                          : log.action.includes('created') || log.action.includes('updated')
                          ? 'bg-green-400'
                          : 'bg-[#5EB47C]'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {formatActivityAction(log.action)}
                        {log.resource_type && (
                          <span className="text-gray-500"> on {log.resource_type}</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                        {log.user_id && <span className="ml-2">User: {log.user_id.substring(0, 8)}...</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;