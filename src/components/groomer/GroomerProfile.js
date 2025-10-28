import React from 'react';

const GroomerProfile = ({ groomerData, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Groomer Profile</h1>
        <p className="text-gray-600">Manage your professional profile and settings</p>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management Coming Soon</h3>
        <p className="text-gray-600">
          Update your professional information, certifications, and business settings.
        </p>
      </div>
    </div>
  );
};

export default GroomerProfile;