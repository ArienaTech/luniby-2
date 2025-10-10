import React from 'react';
import PropTypes from 'prop-types';

const TabButton = ({ id, label, isActive, onClick, icon }) => (
  <button
    onClick={() => onClick(id)}
    className={`py-2 px-1 font-medium text-sm whitespace-nowrap flex-shrink-0 flex items-center space-x-2 ${
      isActive
        ? 'text-[#5EB47C]'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon && <span>{icon}</span>}
    <span>{label}</span>
  </button>
);

TabButton.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.element,
};

const PetOwnerTabs = ({ activeTab, onTabChange, tabs }) => {
  const defaultTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'health', label: 'Health Records' },
    { id: 'cases', label: 'SOAP Notes' },
    { id: 'favorites', label: 'Favorites' },
  ];

  const tabsToRender = tabs || defaultTabs;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabsToRender.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={onTabChange}
              icon={tab.icon}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

PetOwnerTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.element,
    })
  ),
};

export default PetOwnerTabs;