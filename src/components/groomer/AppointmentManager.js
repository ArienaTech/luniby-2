import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AppointmentManager = ({ groomerData, onStatsUpdate }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Load appointments
  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    if (!groomerData?.profile?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select(`
          *,
          pet_profiles(name, breed, owner_name, owner_phone),
          grooming_services(name, duration, price)
        `)
        .eq('groomer_id', groomerData.profile.id)
        .order('appointment_date', { ascending: true });

      // Apply filters
      const today = new Date().toISOString().split('T')[0];
      switch (filter) {
        case 'today':
          query = query.eq('appointment_date', today);
          break;
        case 'upcoming':
          query = query.gte('appointment_date', today).neq('status', 'completed');
          break;
        case 'completed':
          query = query.eq('status', 'completed');
          break;
        default:
          // 'all' case - no filtering needed
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Refresh appointments and stats
      loadAppointments();
      onStatsUpdate();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Manager</h1>
          <p className="text-gray-600">Manage your grooming appointments and schedule</p>
        </div>
        <button
          onClick={() => setShowNewAppointmentModal(true)}
          className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
        >
          + New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Appointments' },
            { key: 'today', label: 'Today' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-[#5EB47C] text-[#5EB47C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {appointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-[#5EB47C] font-semibold">
                            {appointment.pet_profiles?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.pet_profiles?.name || 'Unknown Pet'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(appointment.status)}`}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Owner:</span> {appointment.pet_profiles?.owner_name || 'Unknown'}
                          </p>
                          <p>
                            <span className="font-medium">Breed:</span> {appointment.pet_profiles?.breed || 'Not specified'}
                          </p>
                          <p>
                            <span className="font-medium">Service:</span> {appointment.grooming_services?.name || appointment.service_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(appointment.appointment_date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(appointment.appointment_time)}
                      </p>
                      {appointment.total_cost && (
                        <p className="text-sm font-medium text-green-600">
                          ${appointment.total_cost}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Start Grooming
                        </button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `No ${filter} appointments found.`
              }
            </p>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
            >
              Schedule Your First Appointment
            </button>
          </div>
        )}
      </div>



      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">New Appointment</h2>
            <p className="text-gray-600 mb-4">
              This feature is coming soon! You'll be able to create new appointments directly from this interface.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Pet Name</label>
                <p className="text-gray-900">{selectedAppointment.pet_profiles?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Owner</label>
                <p className="text-gray-900">{selectedAppointment.pet_profiles?.owner_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{selectedAppointment.pet_profiles?.owner_phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Service</label>
                <p className="text-gray-900">{selectedAppointment.grooming_services?.name || selectedAppointment.service_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <p className="text-gray-900">
                  {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                </p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;