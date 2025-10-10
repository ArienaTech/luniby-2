import React from 'react';

const GroomerAnalytics = ({ groomerData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600">View your business performance and insights</p>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard Coming Soon</h3>
        <p className="text-gray-600">
          Detailed analytics including revenue trends, popular services, and client insights.
        </p>
      </div>
    </div>
  );
};

export default GroomerAnalytics;