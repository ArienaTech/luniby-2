import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const FloatingActionButton = ({ 
  onClick, 
  to, 
  className, 
  title, 
  children, 
  badge 
}) => {
  const baseClassName = "group rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative";
  const combinedClassName = `${baseClassName} ${className}`;

  const content = (
    <>
      {children}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 rounded-full font-bold">
          {badge}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClassName} title={title}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName} title={title}>
      {content}
    </button>
  );
};

const PetOwnerFloatingActions = ({
  canUseAiTriage,
  canCreateCaseThisWeek,
  userPlan,
  getRemainingFreeCasesThisWeek,
  onShowExtraCaseModal,
  showMobileMenu,
  onToggleMobileMenu,
}) => {
  const renderTriageButton = () => {
    if (canUseAiTriage && canCreateCaseThisWeek) {
      const remaining = getRemainingFreeCasesThisWeek();
      const showBadge = userPlan === 'free' && remaining !== 'Unlimited' && remaining <= 1;
      
      return (
        <FloatingActionButton
          to="/luni-triage"
          className="bg-red-500 hover:bg-red-600 text-white"
          title={`Emergency AI Health Check${userPlan === 'free' ? ` (${remaining} free cases left this week)` : ''}`}
          badge={showBadge ? remaining : null}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </FloatingActionButton>
      );
    }

    if (canUseAiTriage && !canCreateCaseThisWeek) {
      return (
        <FloatingActionButton
          onClick={onShowExtraCaseModal}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          title="Buy Extra Case - $2.99"
          badge="$2.99"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </FloatingActionButton>
      );
    }

    return (
      <FloatingActionButton
        to="/pricing"
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        title="Upgrade for AI Health Check"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </FloatingActionButton>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col space-y-2 sm:space-y-3 z-50">
      {/* Emergency/AI Triage Button */}
      {renderTriageButton()}

      {/* Main FAB with expandable menu */}
      <div className="relative">
        <FloatingActionButton
          onClick={() => onToggleMobileMenu(!showMobileMenu)}
          className="bg-gray-800 hover:bg-gray-900 text-white lg:hidden"
          title="Quick Actions"
        >
          <svg 
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${showMobileMenu ? 'rotate-45' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </FloatingActionButton>

        {/* Mobile menu items */}
        {showMobileMenu && (
          <div className="absolute bottom-16 right-0 flex flex-col space-y-2 lg:hidden">
            <FloatingActionButton
              to="/marketplace"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title="Browse Services"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </FloatingActionButton>
            
            <FloatingActionButton
              to="/favorites"
              className="bg-pink-600 hover:bg-pink-700 text-white"
              title="My Favorites"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </FloatingActionButton>
          </div>
        )}
      </div>
    </div>
  );
};

FloatingActionButton.propTypes = {
  onClick: PropTypes.func,
  to: PropTypes.string,
  className: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

PetOwnerFloatingActions.propTypes = {
  canUseAiTriage: PropTypes.func.isRequired,
  canCreateCaseThisWeek: PropTypes.func.isRequired,
  userPlan: PropTypes.string.isRequired,
  getRemainingFreeCasesThisWeek: PropTypes.func.isRequired,
  onShowExtraCaseModal: PropTypes.func.isRequired,
  showMobileMenu: PropTypes.bool.isRequired,
  onToggleMobileMenu: PropTypes.func.isRequired,
};

export default PetOwnerFloatingActions;