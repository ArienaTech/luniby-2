import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const Earnings = ({ groomerData }) => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEarningsData();
  }, [groomerData]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll show empty state since earnings tracking isn't implemented yet
      // In the future, this would fetch from a transactions/payments database table
      setEarnings({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0
      });

      setTransactions([]);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'pending_payment': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
        <span className="ml-2 text-gray-600">Loading earnings data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600">Track your income from marketplace bookings</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.today.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 text-blue-600">
              <span className="text-xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.thisWeek.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 text-green-600">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.thisMonth.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 text-purple-600">
              <span className="text-xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.total.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 text-orange-600">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Transaction History' },
              { id: 'analytics', name: 'Analytics' }
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
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-600">Complete some bookings to start earning!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Pet/Owner</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Commission</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Net Earnings</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {transaction.service}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{transaction.pet_name}</div>
                              <div className="text-gray-600">{transaction.owner_name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-red-600">
                            -${transaction.commission.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-green-600">
                            ${transaction.net_earnings.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Commission Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Commission Structure</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Platform fee: 10% of total booking amount</p>
                  <p>• Payment processing: Included in platform fee</p>
                  <p>• You keep 90% of each completed booking</p>
                  <p>• Payments are processed within 24 hours of completion</p>
                </div>
              </div>

              {/* Service Breakdown */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Performance</h3>
                <div className="space-y-3">
                  {['Full Grooming', 'Bath & Brush', 'Nail Trim', 'Styling'].map((service) => {
                    const serviceTransactions = transactions.filter(t => t.service === service && t.status === 'completed');
                    const serviceEarnings = serviceTransactions.reduce((sum, t) => sum + t.net_earnings, 0);
                    const serviceCount = serviceTransactions.length;
                    const avgEarnings = serviceCount > 0 ? serviceEarnings / serviceCount : 0;

                    return (
                      <div key={service} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{service}</p>
                          <p className="text-sm text-gray-600">{serviceCount} completed</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${serviceEarnings.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Avg: ${avgEarnings.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;