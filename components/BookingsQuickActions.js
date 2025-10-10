import React from 'react';
import { Link } from 'react-router-dom';
import { HealthIcon, UIIcon } from './MinimalIcons';

const BookingsQuickActions = ({ 
  bookings = [], 
  onSetActiveTab 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            bookings.length > 0 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {bookings.length === 0 ? 'No Bookings' : `${bookings.length} Booking${bookings.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking, index) => (
              <div key={index} className="p-3 rounded-lg border-l-4 bg-blue-50 border-blue-400">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <HealthIcon type="calendar" className="w-5 h-5 mr-3 mt-0.5" color="#6B7280" />
                    <div>
                      <p className="font-medium text-gray-900">{booking.service_name}</p>
                      <p className="text-sm text-gray-600">{booking.provider_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.consultation_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <HealthIcon type="calendar" className="w-6 h-6" color="#3B82F6" />
            </div>
            <p className="text-gray-600 mb-4">No upcoming bookings</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium"
            >
              Book a Service
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => onSetActiveTab('health')}
            className="w-full flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <HealthIcon type="health" className="w-5 h-5" color="#3B82F6" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Health Records</p>
              <p className="text-sm text-gray-500">View and manage health data</p>
            </div>
          </button>
          <Link
            to="/marketplace"
            className="w-full flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <UIIcon type="shopping" className="w-5 h-5" color="#8B5CF6" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Book Services</p>
              <p className="text-sm text-gray-500">Find vets and pet services</p>
            </div>
          </Link>
          <Link
            to="/triage"
            className="w-full flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <HealthIcon type="vaccination" className="w-5 h-5" color="#10B981" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Health Triage</p>
              <p className="text-sm text-gray-500">Get instant health advice</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingsQuickActions;