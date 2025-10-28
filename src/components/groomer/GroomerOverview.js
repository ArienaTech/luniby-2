import React from 'react';

const GroomerOverview = ({ stats, groomerData, onQuickAction }) => {
  const quickStats = [
    {
      title: "Marketplace Jobs",
      value: stats.todayAppointments,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Weekly Earnings",
      value: `$${stats.weeklyRevenue.toFixed(2)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Active Bookings",
      value: stats.totalPets,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      ),
      color: "bg-[#5EB47C]",
      change: "+3",
      changeType: "positive"
    },
    {
      title: "Jobs Completed",
      value: stats.completedGrooming,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ),
      color: "bg-orange-500",
      change: "+15%",
      changeType: "positive"
    }
  ];

  // For now, show empty appointments since booking system isn't implemented yet
  const upcomingAppointments = [];

  const recentActivity = [
    {
      id: 1,
      type: "appointment_completed",
      message: "Completed grooming for Charlie (Border Collie)",
      time: "2 hours ago",
      icon: "✅"
    },
    {
      id: 2,
      type: "new_booking",
      message: "New appointment booked for tomorrow - Daisy (Beagle)",
      time: "4 hours ago",
      icon: "📅"
    },
    {
      id: 3,
      type: "payment_received",
      message: "Payment received from Tom Wilson - $85.00",
      time: "6 hours ago",
      icon: "💳"
    },
    {
      id: 4,
      type: "supply_alert",
      message: "Low stock alert: Premium Shampoo (2 bottles left)",
      time: "1 day ago",
      icon: "⚠️"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Welcome back, {groomerData?.profile?.full_name?.split(' ')[0] || 'Professional Groomer'}
        </h1>
        <p className="text-gray-600">
          You have {stats.todayAppointments} appointments today and {stats.pendingAppointments} pending bookings.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Marketplace Jobs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.todayAppointments}</p>
              </div>
              <div className="w-8 h-8 text-blue-600">
                <span className="text-xl">🛒</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Weekly Earnings</p>
                <p className="text-2xl font-bold text-green-900">${stats.weeklyRevenue.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 text-green-600">
                <span className="text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Active Bookings</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalPets}</p>
              </div>
              <div className="w-8 h-8 text-purple-600">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Jobs Completed</p>
                <p className="text-2xl font-bold text-orange-900">{stats.completedGrooming}</p>
              </div>
              <div className="w-8 h-8 text-orange-600">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today's Bookings</h2>
              <button
                onClick={() => onQuickAction('bookings')}
                className="text-[#5EB47C] hover:text-[#4A9A64] text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-[#5EB47C] font-semibold">
                        {appointment.petName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {appointment.petName} ({appointment.breed})
                        </h3>
                        <span className="text-sm text-gray-500">{appointment.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {appointment.ownerName} • {appointment.service}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 mt-1">Note: {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📅</div>
                <p className="text-gray-500">No appointments scheduled for today</p>
                <button
                  onClick={() => onQuickAction('appointments')}
                  className="mt-3 text-[#5EB47C] hover:text-[#4A9A64] text-sm font-medium"
                >
                  Schedule an appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={() => onQuickAction('marketplace')} 
            className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Browse Marketplace</div>
              <div className="text-sm text-gray-600">Find new grooming jobs</div>
            </div>
          </button>
          
          <button 
            onClick={() => onQuickAction('bookings')} 
            className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-[#5EB47C] rounded-md flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">My Bookings</div>
              <div className="text-sm text-gray-600">View accepted jobs & schedule</div>
            </div>
          </button>
          
          <button 
            onClick={() => onQuickAction('messages')} 
            className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Messages</div>
              <div className="text-sm text-gray-600">Chat with pet owners</div>
            </div>
          </button>

          <button 
            onClick={() => onQuickAction('services')} 
            className="w-full flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center mr-3">
              <span className="text-white text-lg">✂️</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">My Services</div>
              <div className="text-sm text-gray-600">Manage service offerings</div>
            </div>
          </button>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {(stats.lowStockItems > 0 || stats.pendingAppointments > 5) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {stats.lowStockItems > 0 && (
                    <li>
                      {stats.lowStockItems} items are running low on stock
                      <button
                        onClick={() => onQuickAction('inventory')}
                        className="ml-2 text-yellow-800 underline hover:no-underline"
                      >
                        Check inventory
                      </button>
                    </li>
                  )}
                  {stats.pendingAppointments > 5 && (
                    <li>
                      You have {stats.pendingAppointments} pending appointment requests
                      <button
                        onClick={() => onQuickAction('appointments')}
                        className="ml-2 text-yellow-800 underline hover:no-underline"
                      >
                        Review requests
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroomerOverview;