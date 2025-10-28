import React, { useState } from 'react';
import { PetIcon, HealthIcon } from './MinimalIcons';

const PetsGallery = ({ 
  pets = [], 
  userPlan = 'free',
  dismissedPetLimitBanner = false,
  onAddPet,
  onEditPet,
  onDeletePet,
  onDismissPetLimitBanner,
  FreemiumLimitBanner // Pass the banner component as prop
}) => {
  const [filterType, setFilterType] = useState('all');

  // Search and filter functionality
  const filteredPets = pets.filter(pet => {
    if (filterType === 'all') return true;
    if (filterType === 'dogs') return pet.species === 'dog';
    if (filterType === 'cats') return pet.species === 'cat';
    return true;
  });

  const canAddMorePets = () => {
    if (userPlan === 'premium') return true;
    return pets.length < 3; // Free tier limited to 3 pets
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-gray-900">My Pets</h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#5EB47C]">
              {pets.length} pet{pets.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onAddPet}
            className="inline-flex items-center px-3 py-1.5 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-all duration-200 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Pet
          </button>
        </div>
      </div>

      {/* Instagram-Style Pet Gallery Content */}
      <div className="p-6">
        {pets.length > 0 && (
          <div className="mb-6">
            {/* Quick Filter Tabs */}
            <div className="flex items-center space-x-1 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === 'all'
                    ? 'bg-[#5EB47C] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({pets.length})
              </button>
              <button
                onClick={() => setFilterType('dogs')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === 'dogs'
                    ? 'bg-[#5EB47C] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dogs
              </button>
              <button
                onClick={() => setFilterType('cats')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === 'cats'
                    ? 'bg-[#5EB47C] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cats
              </button>
            </div>
          </div>
        )}

        {/* Instagram-Style Grid */}
        {filteredPets.length > 0 ? (
          <div className="flex overflow-x-auto scrollbar-hide gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-3 pb-2">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex-shrink-0 w-40 sm:w-auto">
                {/* Pet Image */}
                <div className="w-full h-full bg-gradient-to-br from-[#E5F4F1] to-[#D1F2EB] flex items-center justify-center">
                  {pet.photo_url ? (
                    <img 
                      src={pet.photo_url} 
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="opacity-80">
                      <PetIcon species={pet.species} className="w-16 h-16 sm:w-20 sm:h-20" color="#6B7280" />
                    </div>
                  )}
                </div>
                
                {/* Overlay with Pet Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-bold text-sm truncate">{pet.name}</h3>
                    <p className="text-xs opacity-90 capitalize">{pet.breed}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPet(pet);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <HealthIcon type="edit" className="w-4 h-4" color="#6B7280" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePet(pet.id);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <HealthIcon type="delete" className="w-4 h-4" color="#EF4444" />
                    </button>
                  </div>
                </div>
                
                {/* Health Status Indicator */}
                <div className="absolute top-2 left-2">
                  <div className={`w-3 h-3 rounded-full ${
                    pet.health_status === 'excellent' ? 'bg-green-400' :
                    pet.health_status === 'good' ? 'bg-yellow-400' :
                    pet.health_status === 'needs_attention' ? 'bg-red-400' :
                    'bg-gray-400'
                  } shadow-sm`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#E5F4F1] rounded-full flex items-center justify-center">
              <PetIcon species="pet" className="w-10 h-10" color="#5EB47C" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your pet family awaits!</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create beautiful memories by adding your first furry, feathered, or scaly companion.
            </p>
            <button
              onClick={onAddPet}
              className="inline-flex items-center px-6 py-3 bg-[#5EB47C] text-white rounded-xl hover:bg-[#4A9A64] transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Pet
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HealthIcon type="search" className="w-8 h-8" color="#6B7280" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pets found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filter criteria.</p>
            <button
              onClick={() => setFilterType('all')}
              className="text-[#5EB47C] hover:text-[#4A9A64] font-medium"
            >
              Show all pets
            </button>
          </div>
        )}
      </div>

      {/* Pet Limit Banner */}
      {userPlan === 'free' && pets.length >= 2 && !dismissedPetLimitBanner && FreemiumLimitBanner && (
        <div className="mt-6 px-5">
          <FreemiumLimitBanner
            feature="Pet"
            current={pets.length}
            limit="2"
            upgradeText="Upgrade to Premium for unlimited pets and advanced features."
            onClose={onDismissPetLimitBanner}
          />
        </div>
      )}
    </div>
  );
};

export default PetsGallery;