import React from 'react';

const BillingManager = ({ groomerData, onStatsUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600">Manage invoices, payments, and financial records</p>
        </div>
        <button className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors">
          + Create Invoice
        </button>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Billing System Coming Soon</h3>
        <p className="text-gray-600">
          Comprehensive billing and payment management features will be available soon.
        </p>
      </div>
    </div>
  );
};

export default BillingManager;