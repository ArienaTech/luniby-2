import React from 'react';
import PropTypes from 'prop-types';

const PetOwnerLayout = ({ 
  children, 
  alerts, 
  loading = false,
  className = "" 
}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <section className={`pt-4 sm:pt-8 pb-8 px-3 sm:px-6 lg:px-12 ${className}`}>
        <div className="max-w-7xl mx-auto">
          {/* Alerts Section */}
          {alerts && alerts.length > 0 && (
            <div className="mb-6">
              {alerts.map((alert, index) => (
                <div key={index} className="mb-4">
                  {alert}
                </div>
              ))}
            </div>
          )}
          
          {/* Main Content */}
          {children}
        </div>
      </section>
    </div>
  );
};

PetOwnerLayout.propTypes = {
  children: PropTypes.node.isRequired,
  alerts: PropTypes.arrayOf(PropTypes.element),
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default PetOwnerLayout;