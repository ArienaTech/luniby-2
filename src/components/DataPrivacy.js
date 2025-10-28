import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const DataPrivacy = () => {
  const { showSuccess, showError, showWarning } = useNotificationContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }
      setUser(user);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get user's bookings
      const { data: bookings } = await supabase
        .from('consultation_bookings')
        .select('*')
        .eq('user_id', userId);

      // Get user's provider listings if they are a provider
      const { data: listings } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('provider_email', profile?.email);

      setUserData({
        profile,
        bookings: bookings || [],
        listings: listings || []
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const exportUserData = async () => {
    setExportLoading(true);
    try {
      if (!userData) {
        await loadUserData(user.id);
      }

      // Create comprehensive data export
      const exportData = {
        profile: userData.profile,
        bookings: userData.bookings,
        listings: userData.listings,
        exportDate: new Date().toISOString(),
        dataTypes: [
          'Personal Information',
          'Booking History',
          'Provider Listings',
          'Account Settings'
        ]
      };

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'data_exported',
        p_resource_type: 'user_data',
        p_resource_id: user.id,
        p_details: { export_date: new Date().toISOString() }
      });

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Your data has been exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      showError('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const deleteUserData = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      showWarning('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setDeleteLoading(true);
    try {
      // Log audit event before deletion
      await supabase.rpc('log_audit_event', {
        p_action: 'account_deletion_requested',
        p_resource_type: 'user_account',
        p_resource_id: user.id,
        p_details: { deletion_date: new Date().toISOString() }
      });

      // Delete user's bookings
      await supabase
        .from('consultation_bookings')
        .delete()
        .eq('user_id', user.id);

      // Delete user's provider listings
      if (userData?.profile?.email) {
        await supabase
          .from('marketplace_listings')
          .delete()
          .eq('provider_email', userData.profile.email);
      }

      // Delete user profile (this will cascade to auth.users due to foreign key)
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // Sign out the user
      await supabase.auth.signOut();

      showSuccess('Your account and all associated data have been deleted.');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      showError('Failed to delete account. Please contact support.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Data Privacy & Control</h1>
              <p className="mt-2 text-gray-600">
                Manage your personal data and privacy settings in compliance with GDPR regulations.
              </p>
            </div>

            {/* Data Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Data Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Profile Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Basic account details, contact information
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Booking History</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {userData?.bookings?.length || 0} consultation bookings
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Provider Data</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    {userData?.listings?.length || 0} service listings
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Rights */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Right to Data Portability</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Export all your personal data in a machine-readable format (JSON).
                  </p>
                  <button
                    onClick={exportUserData}
                    disabled={exportLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportLoading ? 'Exporting...' : 'Export My Data'}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Right to Access</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    View all personal data we have stored about you.
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>Email:</strong> {userData?.profile?.email}</p>
                    <p><strong>Name:</strong> {userData?.profile?.full_name || 'Not provided'}</p>
                    <p><strong>Role:</strong> {userData?.profile?.role === 'pet_owner' ? 'Pet Owner' : userData?.profile?.role || 'Pet Owner'}</p>
                    <p><strong>Account Created:</strong> {userData?.profile?.created_at ? new Date(userData.profile.created_at).toLocaleDateString() : 'Unknown'}</p>
                    <p><strong>Last Updated:</strong> {userData?.profile?.updated_at ? new Date(userData.profile.updated_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Right to Rectification</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Update or correct your personal information.
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Update Profile
                  </button>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium text-red-900 mb-2">Right to Erasure (Right to be Forgotten)</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete My Account
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-red-200">
                        <h4 className="font-medium text-red-900 mb-2">Confirm Account Deletion</h4>
                        <p className="text-sm text-red-700 mb-4">
                          This will permanently delete:
                        </p>
                        <ul className="text-sm text-red-700 list-disc list-inside mb-4">
                          <li>Your profile and personal information</li>
                          <li>All booking history ({userData?.bookings?.length || 0} bookings)</li>
                          <li>All service listings ({userData?.listings?.length || 0} listings)</li>
                          <li>Account access and login credentials</li>
                        </ul>
                        <p className="text-sm text-red-700 mb-4">
                          Type <strong>"DELETE MY ACCOUNT"</strong> to confirm:
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                          placeholder="DELETE MY ACCOUNT"
                        />
                        <div className="flex space-x-3">
                          <button
                            onClick={deleteUserData}
                            disabled={deleteLoading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading ? 'Deleting...' : 'Confirm Deletion'}
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Processing Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                <h3 className="font-medium text-gray-900 mb-2">How we use your data:</h3>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>To provide and improve our pet care marketplace services</li>
                  <li>To facilitate bookings between customers and providers</li>
                  <li>To send important notifications about your bookings</li>
                  <li>To ensure platform security and prevent fraud</li>
                  <li>To comply with legal obligations</li>
                </ul>
                <h3 className="font-medium text-gray-900 mb-2">Data retention:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Profile data: Retained while your account is active</li>
                  <li>Booking history: Retained for 7 years for business records</li>
                  <li>Audit logs: Retained for 1 year for security purposes</li>
                  <li>All data is permanently deleted upon account deletion request</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Questions about your data?</h2>
              <p className="text-sm text-gray-600">
                If you have any questions about how we handle your personal data or want to exercise any of your rights, 
                please contact our Data Protection Officer at{' '}
                <a href="mailto:privacy@petcaremarketplace.com" className="text-blue-600 hover:underline">
                  privacy@petcaremarketplace.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPrivacy;