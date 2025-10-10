import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import logger from '../lib/logger';
import { UIIcon } from './MinimalIcons';

const ProviderAvailability = ({ providerId, onClose }) => {
  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00', breaks: [] },
    tuesday: { enabled: true, start: '09:00', end: '17:00', breaks: [] },
    wednesday: { enabled: true, start: '09:00', end: '17:00', breaks: [] },
    thursday: { enabled: true, start: '09:00', end: '17:00', breaks: [] },
    friday: { enabled: true, start: '09:00', end: '17:00', breaks: [] },
    saturday: { enabled: false, start: '10:00', end: '14:00', breaks: [] },
    sunday: { enabled: false, start: '10:00', end: '14:00', breaks: [] }
  });

  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: true,
    whatsapp: false,
    phone: '',
    notification_hours: {
      start: '08:00',
      end: '20:00'
    },
    auto_accept: false,
    auto_accept_hours: {
      start: '09:00',
      end: '17:00'
    }
  });

  const [consultationTypes, setConsultationTypes] = useState([
    { type: 'general', duration: 30, price: 80, enabled: true },
    { type: 'follow_up', duration: 15, price: 40, enabled: true },
    { type: 'prescription', duration: 20, price: 50, enabled: true },
    { type: 'nutrition', duration: 45, price: 90, enabled: false },
    { type: 'behavior', duration: 60, price: 120, enabled: false },
    { type: 'second_opinion', duration: 30, price: 100, enabled: false }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const loadProviderSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .single();

      if (data) {
        setAvailability(data.availability || availability);
        setNotifications(data.notification_settings || notifications);
        setConsultationTypes(data.consultation_types || consultationTypes);
      }
    } catch (error) {
      logger.error('Error loading provider settings:', error);
    }
  }, [providerId, availability, notifications, consultationTypes]);

  useEffect(() => {
    loadProviderSettings();
  }, [loadProviderSettings]);

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsultationTypeChange = (index, field, value) => {
    setConsultationTypes(prev => 
      prev.map((type, i) => 
        i === index ? { ...type, [field]: value } : type
      )
    );
  };

  const saveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id: providerId,
          availability,
          notification_settings: notifications,
          consultation_types: consultationTypes,
          updated_at: new Date().toISOString()
        });

      if (error) {
        setError('Failed to save settings. Please try again.');
      } else {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 font-montserrat pr-2">
            Availability & Notification Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 -mr-1"
          >
            <UIIcon type="close" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl font-montserrat text-sm mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-montserrat text-sm mb-6">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Weekly Availability */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 font-montserrat">
              Weekly Availability
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {days.map(({ key, label }) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="sm:w-24">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={availability[key].enabled}
                        onChange={(e) => handleAvailabilityChange(key, 'enabled', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900 font-montserrat">
                        {label}
                      </span>
                    </label>
                  </div>
                  
                  {availability[key].enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:space-x-2">
                        <div className="space-y-1">
                          <label className="block text-xs text-gray-600 font-medium sm:hidden">From</label>
                          <input
                            type="time"
                            value={availability[key].start}
                            onChange={(e) => handleAvailabilityChange(key, 'start', e.target.value)}
                            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                          />
                        </div>
                        <span className="text-gray-500 text-sm hidden sm:inline sm:mt-0 mt-6">to</span>
                        <div className="space-y-1">
                          <label className="block text-xs text-gray-600 font-medium sm:hidden">To</label>
                          <input
                            type="time"
                            value={availability[key].end}
                            onChange={(e) => handleAvailabilityChange(key, 'end', e.target.value)}
                            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 font-montserrat">
              Notification Preferences
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                  Phone Number for SMS/WhatsApp
                </label>
                <input
                  type="tel"
                  value={notifications.phone}
                  onChange={(e) => handleNotificationChange('phone', e.target.value)}
                  className="block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                  placeholder="+61 4XX XXX XXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                    Notification Methods
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'sms', label: 'SMS Text Messages' },
                      { key: 'email', label: 'Email Notifications' },
                      { key: 'push', label: 'Push Notifications' },
                      { key: 'whatsapp', label: 'WhatsApp Messages' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notifications[key]}
                          onChange={(e) => handleNotificationChange(key, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900 font-montserrat">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                    Notification Hours
                  </label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:space-x-2">
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600 font-medium sm:hidden">From</label>
                        <input
                          type="time"
                          value={notifications.notification_hours.start}
                          onChange={(e) => handleNotificationChange('notification_hours', {
                            ...notifications.notification_hours,
                            start: e.target.value
                          })}
                          className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                        />
                      </div>
                      <span className="text-gray-500 text-sm hidden sm:inline">to</span>
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600 font-medium sm:hidden">To</label>
                        <input
                          type="time"
                          value={notifications.notification_hours.end}
                          onChange={(e) => handleNotificationChange('notification_hours', {
                            ...notifications.notification_hours,
                            end: e.target.value
                          })}
                          className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-montserrat">
                      Only receive notifications during these hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.auto_accept}
                    onChange={(e) => handleNotificationChange('auto_accept', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 font-montserrat">
                    Auto-accept bookings during business hours
                  </span>
                </label>
                
                {notifications.auto_accept && (
                  <div className="mt-2 ml-3 sm:ml-6">
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:space-x-2">
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600 font-medium sm:hidden">From</label>
                        <input
                          type="time"
                          value={notifications.auto_accept_hours.start}
                          onChange={(e) => handleNotificationChange('auto_accept_hours', {
                            ...notifications.auto_accept_hours,
                            start: e.target.value
                          })}
                          className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                        />
                      </div>
                      <span className="text-gray-500 text-sm hidden sm:inline">to</span>
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600 font-medium sm:hidden">To</label>
                        <input
                          type="time"
                          value={notifications.auto_accept_hours.end}
                          onChange={(e) => handleNotificationChange('auto_accept_hours', {
                            ...notifications.auto_accept_hours,
                            end: e.target.value
                          })}
                          className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Consultation Types & Pricing */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 font-montserrat">
              Consultation Types & Pricing
            </h3>
            <div className="space-y-3">
              {consultationTypes.map((consultation, index) => (
                <div key={consultation.type} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={consultation.enabled}
                      onChange={(e) => handleConsultationTypeChange(index, 'enabled', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 font-montserrat capitalize">
                      {consultation.type.replace('_', ' ')}
                    </span>
                  </label>
                  
                  {consultation.enabled && (
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:space-x-4">
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600 font-medium sm:hidden">Duration</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={consultation.duration}
                            onChange={(e) => handleConsultationTypeChange(index, 'duration', parseInt(e.target.value))}
                            className="w-full sm:w-20 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                            min="5"
                            max="120"
                          />
                          <span className="text-sm text-gray-500">min</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600 font-medium sm:hidden">Price</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            value={consultation.price}
                            onChange={(e) => handleConsultationTypeChange(index, 'price', parseInt(e.target.value))}
                            className="w-full sm:w-24 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat text-base sm:text-sm"
                            min="10"
                            max="500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-gray-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-green-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderAvailability;