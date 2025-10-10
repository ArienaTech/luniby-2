import React from 'react';
import PropTypes from 'prop-types';
import { UIIcon } from '../MinimalIcons';

const DashboardNavigation = ({ activeSection, setActiveSection, providerType, asSidebar = false }) => {
  // Dynamic navigation sections based on provider type
  const getNavigationSections = (providerType) => {
    const baseSections = [
      { id: 'overview', name: 'Overview', icon: <UIIcon type="overview" className="w-5 h-5" /> },
      { id: 'marketplace', name: 'Marketplace', icon: <UIIcon type="marketplace" className="w-5 h-5" /> },
      { id: 'schedule', name: 'Schedule', icon: <UIIcon type="schedule" className="w-5 h-5" /> },
      { id: 'messages', name: 'Messages', icon: <UIIcon type="messages" className="w-5 h-5" /> },
      { id: 'analytics', name: 'Analytics', icon: <UIIcon type="analytics" className="w-5 h-5" /> },
      { id: 'profile', name: 'Profile', icon: <UIIcon type="profile" className="w-5 h-5" /> }
    ];
    
    if (providerType === 'veterinarian') {
      return [
        ...baseSections.slice(0, 2),
        { id: 'patients', name: 'Patients', icon: <UIIcon type="patients" className="w-5 h-5" /> },
        { id: 'procedures', name: 'Procedures', icon: <UIIcon type="procedures" className="w-5 h-5" /> },
        ...baseSections.slice(2)
      ];
    } else {
      return [
        ...baseSections.slice(0, 2),
        { id: 'triage', name: 'Cases', icon: <UIIcon type="triageCases" className="w-5 h-5" /> },
        ...baseSections.slice(2)
      ];
    }
  };

  const navigationSections = getNavigationSections(providerType);

  if (asSidebar) {
    return (
      <>
        {navigationSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
              activeSection === section.id
                ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            <span className="mr-3">{section.icon}</span>
            {section.name}
          </button>
        ))}
      </>
    );
  }

  return (
    <nav className="flex space-x-8 border-b border-gray-200 bg-white px-6">
      {navigationSections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`flex items-center space-x-2 py-4 px-2 font-medium text-sm transition-colors ${
            activeSection === section.id
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {section.icon}
          <span>{section.name}</span>
        </button>
      ))}
    </nav>
  );
};

DashboardNavigation.propTypes = {
  activeSection: PropTypes.string.isRequired,
  setActiveSection: PropTypes.func.isRequired,
  providerType: PropTypes.string,
  asSidebar: PropTypes.bool,
};

export default DashboardNavigation;