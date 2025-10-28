import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { UIIcon } from '../MinimalIcons';

const FreemiumLimitBanner = ({ 
  feature, 
  current, 
  limit, 
  upgradeText, 
  onClose, 
  className = "" 
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6 ${className}`}>
    <div className="px-4 sm:px-8 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-start sm:items-center flex-1">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-[#5EB47C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {feature} Limit Reached
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              You're using {current} of {limit} {feature.toLowerCase()} on your free plan. {upgradeText}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:ml-4">
          <Link
            to="/pricing"
            className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
          >
            Upgrade Now
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const SpendingAwarenessBanner = ({ totalSpentOnExtras, userPlan }) => {
  if (userPlan !== 'free' || totalSpentOnExtras < 6) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 flex items-center">
              <UIIcon type="money" className="w-4 h-4 mr-2" color="currentColor" />
              You've spent ${totalSpentOnExtras.toFixed(2)} on extra Luni Triage
            </h3>
            <p className="text-sm text-yellow-700">
              Premium is only $9.99/month for unlimited access - you'd save money!
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link
            to="/upgrade"
            className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const UsageLimitBanner = ({ 
  userPlan, 
  canCreateCaseThisWeek, 
  onShowExtraCaseModal 
}) => {
  if (userPlan !== 'free' || canCreateCaseThisWeek) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-start sm:items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-xs sm:text-sm font-medium text-blue-800">
              You've used your free Luni Triage for this week
            </h3>
            <p className="text-xs sm:text-sm text-blue-700">
              Get instant access to another Luni Triage consultation for just $2.99, or upgrade to Premium for unlimited access.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-shrink-0">
          <button
            onClick={onShowExtraCaseModal}
            className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
          >
            Buy Extra Luni Triage - $2.99
          </button>
          <Link
            to="/upgrade"
            className="bg-white text-blue-600 border border-blue-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-all text-center"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
};

const PetOwnerBanners = ({
  userPlan,
  aiTriageCount,
  totalSpentOnExtras,
  canCreateCaseThisWeek,
  onShowExtraCaseModal,
}) => {
  const banners = [];

  // AI Triage limit banner
  if (userPlan === 'free' && aiTriageCount >= 3) {
    banners.push(
      <FreemiumLimitBanner
        key="ai-triage-limit"
        feature="AI Triage"
        current={aiTriageCount}
        limit="3"
        upgradeText="Get unlimited AI health consultations with Premium."
      />
    );
  }

  // Spending awareness banner
  banners.push(
    <SpendingAwarenessBanner
      key="spending-awareness"
      totalSpentOnExtras={totalSpentOnExtras}
      userPlan={userPlan}
    />
  );

  // Usage limit banner
  banners.push(
    <UsageLimitBanner
      key="usage-limit"
      userPlan={userPlan}
      canCreateCaseThisWeek={canCreateCaseThisWeek}
      onShowExtraCaseModal={onShowExtraCaseModal}
    />
  );

  return (
    <div className="banners-container">
      {banners.filter(Boolean)}
    </div>
  );
};

// PropTypes
FreemiumLimitBanner.propTypes = {
  feature: PropTypes.string.isRequired,
  current: PropTypes.number.isRequired,
  limit: PropTypes.string.isRequired,
  upgradeText: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

SpendingAwarenessBanner.propTypes = {
  totalSpentOnExtras: PropTypes.number.isRequired,
  userPlan: PropTypes.string.isRequired,
};

UsageLimitBanner.propTypes = {
  userPlan: PropTypes.string.isRequired,
  canCreateCaseThisWeek: PropTypes.bool.isRequired,
  onShowExtraCaseModal: PropTypes.func.isRequired,
};

PetOwnerBanners.propTypes = {
  userPlan: PropTypes.string.isRequired,
  aiTriageCount: PropTypes.number.isRequired,
  totalSpentOnExtras: PropTypes.number.isRequired,
  canCreateCaseThisWeek: PropTypes.bool.isRequired,
  onShowExtraCaseModal: PropTypes.func.isRequired,
};

export default PetOwnerBanners;
export { FreemiumLimitBanner, SpendingAwarenessBanner, UsageLimitBanner };