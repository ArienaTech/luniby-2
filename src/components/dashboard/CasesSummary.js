import React from 'react';
import PropTypes from 'prop-types';

const CasesSummary = ({ triageCases, setActiveSection }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Cases</h3>
          <button 
            onClick={() => setActiveSection('cases')} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
      </div>
      <div className="p-6">
        {triageCases.length > 0 ? (
          <div className="space-y-3">
            {triageCases.slice(0, 3).map((case_item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{case_item.pet_name}</p>
                  <p className="text-sm text-gray-600">
                    {case_item.consultation_type || case_item.case_type || 'Triage Assessment'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(case_item.created_at).toLocaleDateString()}
                  </p>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {case_item.status === 'pending' ? '🩺 Needs Triage' : case_item.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
            {triageCases.length > 3 && (
              <div className="text-center pt-3">
                <button 
                  onClick={() => setActiveSection('cases')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  +{triageCases.length - 3} more cases
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🩺</div>
            <p className="text-gray-500 mb-2">No cases yet</p>
            <p className="text-sm text-gray-400">
              All cases will appear here with LuniTriage severity assessment when pet owners request your services
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

CasesSummary.propTypes = {
  triageCases: PropTypes.arrayOf(PropTypes.shape({
    pet_name: PropTypes.string,
    created_at: PropTypes.string,
    provider_listings: PropTypes.shape({
      service_type: PropTypes.string,
    }),
  })).isRequired,
  setActiveSection: PropTypes.func.isRequired,
};

export default CasesSummary;