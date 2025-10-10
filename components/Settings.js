import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useNotificationContext } from '../contexts/NotificationContext';
import { STORAGE_BUCKETS } from '../lib/constants';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form states

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    data_sharing: false,
    analytics_tracking: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        
        setLoading(false);
        return;
      }

      setUser(user);

      // Load user profile
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      

      if (profileError && profileError.code !== 'PGRST116') {
        
      }

      if (profileData) {
        
        setProfile(profileData);
        
        // Load profile photo if it exists
        if (profileData.avatar_url) {
          setProfilePhotoUrl(profileData.avatar_url);
        }
        
        // Load notification settings if they exist
        if (profileData.notification_settings) {
          setNotificationSettings({
            ...notificationSettings,
            ...profileData.notification_settings
          });
        }
        
        // Load privacy settings if they exist
        if (profileData.privacy_settings) {
          setPrivacySettings({
            ...privacySettings,
            ...profileData.privacy_settings
          });
        }
      } else {
        
        // If no profile exists, set up default profile structure
        setProfile({
          id: user.id,
          email: user.email,
          full_name: '',
          phone: '',
          location: '',
          avatar_url: null
        });
      }

    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {


      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile?.full_name,
          phone: profile?.phone,
          location: profile?.location,
          avatar_url: profilePhotoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      

      if (error) throw error;

      // Refresh the profile data to show updated changes
      await loadUserData();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setUploadingPhoto(true);
      
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-photos/profile-${user.id}-${Date.now()}.${fileExt}`;
      
      
      
      // Upload to Supabase Storage
      
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.PET_OWNERS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        
        throw uploadError;
      }
      
      
      // Get public URL
      
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.PET_OWNERS)
        .getPublicUrl(fileName);
      
      
      // Update profile with photo URL
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        
        throw updateError;
      }
      
     
      setProfilePhotoUrl(publicUrl);
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to upload photo: ${error.message || 'Unknown error'}. Please try again.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setUploadingPhoto(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setUploadingPhoto(true);
      
      // Remove photo URL from profile
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfilePhotoUrl(null);
      setProfile(prev => ({ ...prev, avatar_url: null }));
      setMessage({ type: 'success', text: 'Profile photo removed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      
      setMessage({ type: 'error', text: 'Failed to remove photo. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile data to show updated changes
      await loadUserData();
      setMessage({ type: 'success', text: 'Notification settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification settings. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: privacySettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile data to show updated changes
      await loadUserData();
      setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update privacy settings. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need to be signed in to access settings.</p>
            <Link
              to="/signin"
              className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings</p>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>User ID: {user?.id || 'Not loaded'}</div>
              <div>User Email: {user?.email || 'Not loaded'}</div>
              <div>Profile Loaded: {profile ? 'Yes' : 'No'}</div>
              <div>Profile: {JSON.stringify(profile)}</div>
              <div>Profile Photo URL: {profilePhotoUrl || 'None'}</div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'profile'
                    ? 'bg-[#5EB47C] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-[#5EB47C] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 17h5l-5 5v-5zM12 3v12" />
                  </svg>
                  Notifications
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('privacy')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'privacy'
                    ? 'bg-[#5EB47C] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'security'
                    ? 'bg-[#5EB47C] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Security
                </div>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  {/* Profile Photo Upload */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                          {profilePhotoUrl ? (
                            <img 
                              src={profilePhotoUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="profile-photo-upload"
                          disabled={uploadingPhoto}
                        />
                        <label
                          htmlFor="profile-photo-upload"
                          className={`bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium cursor-pointer inline-block ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                        </label>
                        {profilePhotoUrl && (
                          <button
                            onClick={handlePhotoRemove}
                            disabled={uploadingPhoto}
                            className={`block text-sm text-red-600 hover:text-red-800 transition-colors ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profile?.full_name || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={profile?.email || user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profile?.phone || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={profile?.location || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive important updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.email_notifications}
                            onChange={(e) => setNotificationSettings({ 
                              ...notificationSettings, 
                              email_notifications: e.target.checked 
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                          <p className="text-sm text-gray-500">Get text messages for urgent updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.sms_notifications}
                            onChange={(e) => setNotificationSettings({ 
                              ...notificationSettings, 
                              sms_notifications: e.target.checked 
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                          <p className="text-sm text-gray-500">Browser notifications for real-time updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.push_notifications}
                            onChange={(e) => setNotificationSettings({ 
                              ...notificationSettings, 
                              push_notifications: e.target.checked 
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                          <p className="text-sm text-gray-500">Receive promotional content and newsletters</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.marketing_emails}
                            onChange={(e) => setNotificationSettings({ 
                              ...notificationSettings, 
                              marketing_emails: e.target.checked 
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={saveNotifications}
                        disabled={saving}
                        className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Notifications'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Visibility
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profile_visibility"
                            value="public"
                            checked={privacySettings.profile_visibility === 'public'}
                            onChange={(e) => setPrivacySettings({ 
                              ...privacySettings, 
                              profile_visibility: e.target.value 
                            })}
                            className="h-4 w-4 text-[#5EB47C] border-gray-300 focus:ring-[#5EB47C]"
                          />
                          <span className="ml-2 text-sm text-gray-700">Public - Anyone can see your profile</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profile_visibility"
                            value="private"
                            checked={privacySettings.profile_visibility === 'private'}
                            onChange={(e) => setPrivacySettings({ 
                              ...privacySettings, 
                              profile_visibility: e.target.value 
                            })}
                            className="h-4 w-4 text-[#5EB47C] border-gray-300 focus:ring-[#5EB47C]"
                          />
                          <span className="ml-2 text-sm text-gray-700">Private - Only you can see your profile</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Data Sharing</h3>
                        <p className="text-sm text-gray-500">Allow sharing anonymized data for research</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.data_sharing}
                          onChange={(e) => setPrivacySettings({ 
                            ...privacySettings, 
                            data_sharing: e.target.checked 
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Analytics Tracking</h3>
                        <p className="text-sm text-gray-500">Help improve our service with usage analytics</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.analytics_tracking}
                          onChange={(e) => setPrivacySettings({ 
                            ...privacySettings, 
                            analytics_tracking: e.target.checked 
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                      </label>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={savePrivacy}
                        disabled={saving}
                        className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Privacy Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Password Management</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Password changes are handled through your authentication provider. 
                            Please check your email for password reset options.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Account Security</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Coming Soon
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Account Actions</h3>
                        <div className="space-y-3">
                          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Download My Data</p>
                                <p className="text-xs text-gray-500">Export all your account data</p>
                              </div>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                          
                          <button className="w-full text-left p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-red-900">Delete Account</p>
                                <p className="text-xs text-red-600">Permanently delete your account and all data</p>
                              </div>
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;