import React, { useState, useEffect } from 'react';
import petService from '../services/petService';
import healthRecordService from '../services/healthRecordService';
import { useNavigate } from 'react-router-dom';

const PetProfileCard = ({ pet, onEdit, onDelete, onSelect, isSelected = false }) => {
  const [healthStats, setHealthStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (pet?.id) {
      loadHealthStats();
    }
  }, [pet?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.pet-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  const loadHealthStats = async () => {
    setLoading(true);
    try {
      const result = await healthRecordService.getHealthStats(pet.id);
      if (result.success) {
        setHealthStats(result.data);
      }
    } catch (error) {
      console.error('Error loading health stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesEmoji = (species) => {
    switch (species?.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'hamster': return '🐹';
      case 'fish': return '🐠';
      case 'reptile': return '🦎';
      default: return '🐾';
    }
  };

  const getHealthStatusColor = () => {
    if (!healthStats) return 'bg-gray-100 text-gray-600';
    
    if (healthStats.overdueVaccinations > 0) {
      return 'bg-red-100 text-red-700';
    } else if (healthStats.nextVaccinationDue && 
               healthRecordService.getDaysUntilDue(healthStats.nextVaccinationDue.next_due_date) <= 30) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-green-100 text-green-700';
  };

  const getHealthStatusText = () => {
    if (!healthStats) return 'Loading...';
    
    if (healthStats.overdueVaccinations > 0) {
      return `${healthStats.overdueVaccinations} Overdue`;
    } else if (healthStats.nextVaccinationDue) {
      const days = healthRecordService.getDaysUntilDue(healthStats.nextVaccinationDue.next_due_date);
      if (days <= 30) {
        return `Due in ${days} days`;
      }
    }
    return 'Up to date';
  };

  const age = petService.calculateAge(pet.birth_date);

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
      isSelected ? 'border-[#5EB47C] ring-2 ring-[#5EB47C] ring-opacity-20' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#5EB47C] rounded-full flex items-center justify-center z-10">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Pet Photo */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
        {pet.photo_url ? (
          <img 
            src={pet.photo_url} 
            alt={pet.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback when no photo or photo fails to load */}
        <div className={`absolute inset-0 flex items-center justify-center ${pet.photo_url ? 'hidden' : 'flex'}`}>
          <span className="text-6xl">{getSpeciesEmoji(pet.species)}</span>
        </div>

        {/* Health Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor()}`}>
            <div className="w-2 h-2 rounded-full bg-current mr-1"></div>
            {loading ? 'Loading...' : getHealthStatusText()}
          </span>
        </div>

        {/* Action Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative pet-dropdown">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
              title="More options"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
                         {/* Dropdown Menu */}
             {showDropdown && (
               <div 
                 className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fadeIn"
                 onClick={(e) => e.stopPropagation()}
               >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (onEdit && typeof onEdit === 'function') {
                      onEdit(pet);
                      setShowDropdown(false);
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Pet
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(false);
                    if (window.confirm(`Are you sure you want to delete ${pet.name}? This action cannot be undone.`)) {
                      onDelete(pet.id);
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Pet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pet Information */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onSelect && onSelect(pet)}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-montserrat">{pet.name}</h3>
            <p className="text-sm text-gray-600">
              {pet.breed || pet.species} {pet.gender && `• ${pet.gender}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{age || 'Unknown age'}</p>
            {pet.weight && (
              <p className="text-xs text-gray-500">{pet.weight} kg</p>
            )}
          </div>
        </div>

        {/* Health Summary */}
        {healthStats && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-lg font-bold text-[#5EB47C]">{healthStats.totalVaccinations}</p>
              <p className="text-xs text-gray-500">Vaccines</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{healthStats.totalHealthRecords}</p>
              <p className="text-xs text-gray-500">Records</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{healthStats.activeMedications}</p>
              <p className="text-xs text-gray-500">Meds</p>
            </div>
          </div>
        )}

        {/* Special Needs & Allergies */}
        <div className="space-y-2">
          {pet.allergies && (
            <div className="flex items-center">
              <span className="text-gray-500 text-xs mr-1">⚠️</span>
              <span className="text-xs text-gray-700 font-medium">Allergies: {pet.allergies}</span>
            </div>
          )}
          {pet.special_needs && (
            <div className="flex items-center">
              <span className="text-gray-500 text-xs mr-1">💊</span>
              <span className="text-xs text-gray-700 font-medium">Special needs: {pet.special_needs}</span>
            </div>
          )}
          {pet.microchip_number && (
            <div className="flex items-center">
              <span className="text-gray-500 text-xs mr-1">🔍</span>
              <span className="text-xs text-gray-700">Microchip: {pet.microchip_number}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) {
                onSelect(pet, 'health');
              }
            }}
            className="flex-1 bg-[#E5F4F1] text-[#5EB47C] py-2 px-3 rounded-lg text-xs font-medium hover:bg-[#5EB47C] hover:text-white transition-colors"
          >
            Health Records
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to appointments
              navigate(`/marketplace?pet=${pet.id}`);
            }}
            className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-600 hover:text-white transition-colors"
          >
            Book Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetProfileCard;