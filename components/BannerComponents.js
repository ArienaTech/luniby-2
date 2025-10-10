import React from 'react';
import { Link } from 'react-router-dom';
import { UIIcon } from './MinimalIcons';

// Freemium limit component
export const FreemiumLimitBanner = ({ 
  feature, 
  current, 
  limit, 
  upgradeText, 
  onClose, 
  className = "" 
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6 ${className}`}>
    <div className="px-4 sm:px-8 py-3 sm:py-4">
      {/* Mobile Layout */}
      <div className="sm:hidden relative">
        {/* Close Button - Top Right Corner (Mobile Only) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
            title="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="pr-8">
          <div className="flex items-start justify-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#5EB47C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1 text-center">
              <h3 className="text-base font-bold text-gray-900">
                {feature} Limit Reached
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                You're using {current} of {limit} {feature.toLowerCase()} on your free plan. {upgradeText}
              </p>
            </div>
          </div>
          
          {/* Centered Full Width Button (Mobile Only) */}
          <div className="w-full">
            <Link
              to="/pricing"
              className="block w-full bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md text-center"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout (Original) */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-[#5EB47C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {feature} Limit Reached
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You're using {current} of {limit} {feature.toLowerCase()} on your free plan. {upgradeText}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Link
            to="/pricing"
            className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
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

// Spending Awareness Banner
export const SpendingAwarenessBanner = ({ totalSpentOnExtras, userPlan }) => {
  if (userPlan !== 'free' || totalSpentOnExtras < 6) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-start sm:items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-xs sm:text-sm font-medium text-yellow-800 flex items-center">
              <UIIcon type="money" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" color="currentColor" />
              You've spent ${totalSpentOnExtras.toFixed(2)} on extra Luni Triage
            </h3>
            <p className="text-xs sm:text-sm text-yellow-700">
              Premium is only $9.99/month for unlimited access - you'd save money!
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link
            to="/upgrade"
            className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
};

// Upgrade CTA component
export const UpgradeCTA = ({ title, description, benefits, compact = false }) => {
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-[#5EB47C] to-green-600 rounded-lg p-3 sm:p-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs opacity-90">{description}</p>
          </div>
          <Link
            to="/pricing"
            className="bg-white text-[#5EB47C] px-3 py-1 rounded text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors flex-shrink-0 text-center"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-dashed border-[#5EB47C] rounded-xl p-4 sm:p-6 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#5EB47C] to-green-600 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4">{description}</p>
      {benefits && (
        <ul className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6 space-y-1">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/pricing"
        className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-md hover:shadow-lg"
      >
        Upgrade to Premium
      </Link>
      <p className="text-xs text-gray-500 mt-2">30-day free trial • Cancel anytime</p>
    </div>
  );
};