import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const MyBookings = ({ groomerData, onStatsUpdate }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadMyBookings();
  }, [groomerData]);

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      
      // For now, we'll show empty state since bookings aren't implemented yet
      // In the future, this would fetch from a bookings database table
      setBookings([]);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
      
      // Refresh stats
      if (onStatsUpdate) onStatsUpdate();
      
      alert(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getServiceColor = (serviceType) => {
    const colors = {
      'Full Grooming': 'bg-blue-100 text-blue-800',
      'Bath & Brush': 'bg-green-100 text-green-800',
      'Nail Trim': 'bg-yellow-100 text-yellow-800',
      'Styling': 'bg-purple-100 text-purple-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  const filterBookings = (status) => {
    switch (status) {
      case 'upcoming':
        return bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'all':
      default:
        return bookings;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
        <span className="ml-2 text-gray-600">Loading your bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your accepted marketplace jobs</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {filterBookings('upcoming').length} Upcoming
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {filterBookings('completed').length} Completed
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'upcoming', name: 'Upcoming', count: filterBookings('upcoming').length },
              { id: 'completed', name: 'Completed', count: filterBookings('completed').length },
              { id: 'all', name: 'All Bookings', count: bookings.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#5EB47C] text-[#5EB47C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Bookings List */}
        <div className="p-6">
          {filterBookings(activeTab).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming' 
                  ? 'You have no upcoming bookings. Check the marketplace for new opportunities.'
                  : 'No bookings match the selected filter.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filterBookings(activeTab).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-[#5EB47C] font-semibold text-lg">
                          {booking.pet_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{booking.pet_name}</h3>
                        <p className="text-sm text-gray-600">{booking.pet_type} • {booking.owner_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getServiceColor(booking.service_type)}`}>
                        {booking.service_type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          {booking.scheduled_date} at {booking.scheduled_time}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          {booking.address}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">💰</span>
                          ${booking.price}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">👤</span>
                          {booking.owner_name}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📞</span>
                          {booking.owner_phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Special Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                        className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium"
                      >
                        Start Service
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Contact Owner
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;