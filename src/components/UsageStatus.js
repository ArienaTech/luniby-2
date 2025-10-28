import React from 'react';
import { Link } from 'react-router-dom';

const UsageStatus = ({
  userPlan = 'free',
  totalSpentOnExtras = 0,
  pets = [],
  onShowExtraCaseModal,
  getRemainingFreeCasesThisWeek,
  canCreateCaseThisWeek,
  canUseAiTriage,
  canAddMorePets
}) => {
  if (userPlan !== 'free') return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Your Usage This Week</h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {totalSpentOnExtras > 0 && (
            <span className="text-xs sm:text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-center">
              ${totalSpentOnExtras.toFixed(2)} spent on extras
            </span>
          )}
          <Link
            to="/pricing"
            className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md text-center"
          >
            Upgrade for Unlimited
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Weekly Luni Triage */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Luni Triage</h4>
              <p className="text-sm text-gray-600">Free AI consultations</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${canCreateCaseThisWeek() ? 'text-green-600' : 'text-red-600'}`}>
                {getRemainingFreeCasesThisWeek()}/1
              </div>
              <p className="text-xs text-gray-500">remaining this week</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${canCreateCaseThisWeek() ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ 
                width: `${Math.min(100, Math.max(0, ((1 - getRemainingFreeCasesThisWeek()) / 1) * 100))}%` 
              }}
            />
          </div>
          {!canCreateCaseThisWeek() && (
            <button
              onClick={onShowExtraCaseModal}
              className="mt-2 w-full text-xs bg-[#5EB47C] text-white py-1 rounded hover:bg-[#4A9A64] transition-colors"
            >
              Buy Extra Luni Triage - $2.99
            </button>
          )}
        </div>
        
        {/* Monthly AI Triage */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Monthly AI Sessions</h4>
              <p className="text-sm text-gray-600">This month's usage</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${canUseAiTriage() ? 'text-green-600' : 'text-red-600'}`}>
                {Math.max(0, 3 - (3 - (canUseAiTriage() ? 3 : 0)))}/3
              </div>
              <p className="text-xs text-gray-500">remaining</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${canUseAiTriage() ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ 
                width: `${Math.min(100, Math.max(0, ((3 - (canUseAiTriage() ? 3 : 0)) / 3) * 100))}%` 
              }}
            />
          </div>
        </div>
        
        {/* Pet Slots */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Pet Slots</h4>
              <p className="text-sm text-gray-600">Maximum pets allowed</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${canAddMorePets() ? 'text-green-600' : 'text-amber-600'}`}>
                {pets.length}/3
              </div>
              <p className="text-xs text-gray-500">pets added</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${pets.length < 3 ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (pets.length / 3) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Limits reset weekly for Luni Triage, monthly for AI sessions. Need more? 
          <button 
            onClick={onShowExtraCaseModal}
            className="text-[#5EB47C] hover:text-[#4A9A64] font-medium ml-1"
          >
            Buy extra Luni Triage for $2.99
          </button> or 
          <Link to="/pricing" className="text-[#5EB47C] hover:text-[#4A9A64] font-medium ml-1">
            upgrade to Premium →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UsageStatus;