import React from 'react';
import PropTypes from 'prop-types';
import { HealthIcon } from '../MinimalIcons';

const StatCard = ({ icon, title, value, color = 'blue', onClick, description }) => (
  <div 
    className={`text-center p-3 sm:p-4 bg-${color}-50 rounded-xl border border-${color}-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
      {icon}
    </div>
    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
      {value}
    </div>
    <div className={`text-xs text-${color}-700 font-medium`}>
      {title}
    </div>
    {description && (
      <div className="text-xs text-gray-500 mt-1">
        {description}
      </div>
    )}
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func,
  description: PropTypes.string,
};

const PetOwnerStats = ({ 
  totalPets, 
  totalHealthRecords, 
  petsUpToDate, 
  healthPercentage, 
  healthAlerts,
  onHealthRecordsClick,
  onAlertsClick 
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      <StatCard
        icon={<HealthIcon type="pet" className="w-6 h-6" color="#3B82F6" />}
        title="My Pets"
        value={totalPets}
        color="blue"
      />
      
      <StatCard
        icon={<HealthIcon type="records" className="w-6 h-6" color="#10B981" />}
        title="Health Records"
        value={totalHealthRecords}
        color="green"
        onClick={onHealthRecordsClick}
      />
      
      <StatCard
        icon={<HealthIcon type="vaccination" className="w-6 h-6" color="#8B5CF6" />}
        title="Up to Date"
        value={petsUpToDate}
        color="purple"
      />
      
      <StatCard
        icon={<HealthIcon type="warning" className="w-6 h-6" color="#F59E0B" />}
        title="Health Alerts"
        value={healthAlerts}
        color="orange"
        onClick={onAlertsClick}
      />
    </div>
  );
};

PetOwnerStats.propTypes = {
  totalPets: PropTypes.number.isRequired,
  totalHealthRecords: PropTypes.number.isRequired,
  petsUpToDate: PropTypes.number.isRequired,
  healthPercentage: PropTypes.number.isRequired,
  healthAlerts: PropTypes.number.isRequired,
  onHealthRecordsClick: PropTypes.func,
  onAlertsClick: PropTypes.func,
};

export default PetOwnerStats;