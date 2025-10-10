import React from 'react';
import PropTypes from 'prop-types';
import { UIIcon } from '../MinimalIcons';

const StatCard = ({ icon, title, value, bgColor = 'bg-blue-500' }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

StatCard.displayName = 'StatCard';
StatCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bgColor: PropTypes.string,
};

const StatsOverview = ({ stats, packages, providerData, bookings, triageCases }) => {
  const servicesIcon = <UIIcon type="services" className="w-6 h-6 text-white" />;
  const packagesIcon = <UIIcon type="products" className="w-6 h-6 text-white" />;
  const casesIcon = <UIIcon type="triageCases" className="w-6 h-6 text-white" />;
  const bookingsIcon = <UIIcon type="appointments" className="w-6 h-6 text-white" />;

  const totalCases = providerData?.provider_type === 'veterinarian' ? bookings.length : triageCases.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={servicesIcon}
        title="My Services"
        value={stats.totalListings}
        bgColor="bg-blue-500"
      />
      
      <StatCard
        icon={packagesIcon}
        title="Service Packages"
        value={packages.length}
        bgColor="bg-purple-500"
      />
      
      <StatCard
        icon={casesIcon}
        title="Total Cases"
        value={totalCases}
        bgColor="bg-green-500"
      />
      
      <StatCard
        icon={bookingsIcon}
        title="Total Bookings"
        value={stats.totalBookings}
        bgColor="bg-orange-500"
      />
    </div>
  );
};

StatsOverview.displayName = 'StatsOverview';

StatsOverview.propTypes = {
  stats: PropTypes.shape({
    totalListings: PropTypes.number,
    totalBookings: PropTypes.number,
  }).isRequired,
  packages: PropTypes.array.isRequired,
  providerData: PropTypes.shape({
    provider_type: PropTypes.string,
  }),
  bookings: PropTypes.array.isRequired,
  triageCases: PropTypes.array.isRequired,
};

export default StatsOverview;