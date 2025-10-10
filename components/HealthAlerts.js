import React from 'react';

const HealthAlerts = ({ healthAlerts = [] }) => {
  if (healthAlerts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className={`rounded-xl p-4 ${
        healthAlerts.some(alert => alert.urgent) 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center mb-2">
          <svg 
            className={`w-5 h-5 mr-2 ${
              healthAlerts.some(alert => alert.urgent) 
                ? 'text-red-600' 
                : 'text-yellow-600'
            }`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <h3 className={`font-semibold ${
            healthAlerts.some(alert => alert.urgent) 
              ? 'text-red-800' 
              : 'text-yellow-800'
          }`}>
            Health Alerts
          </h3>
        </div>
        <div className="space-y-1">
          {healthAlerts.map((alert, index) => (
            <p 
              key={index} 
              className={`text-sm ${
                healthAlerts.some(alert => alert.urgent) 
                  ? 'text-red-700' 
                  : 'text-yellow-700'
              }`}
            >
              <strong>{alert.petName}:</strong> {alert.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthAlerts;