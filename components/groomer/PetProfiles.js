import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PetProfiles = ({ groomerData, onStatsUpdate }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    temperament: '',
    special_needs: '',
    preferred_services: '',
    notes: ''
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    if (!groomerData?.profile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pet_profiles')
        .select(`
          *,
          grooming_history(
            id,
            service_date,
            service_type,
            notes,
            before_photo,
            after_photo
          )
        `)
        .eq('groomer_id', groomerData.profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = async () => {
    try {
      const { error } = await supabase
        .from('pet_profiles')
        .insert({
          ...newPet,
          groomer_id: groomerData.profile.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Reset form and reload pets
      setNewPet({
        name: '',
        breed: '',
        age: '',
        weight: '',
        owner_name: '',
        owner_phone: '',
        owner_email: '',
        temperament: '',
        special_needs: '',
        preferred_services: '',
        notes: ''
      });
      setShowAddPetModal(false);
      loadPets();
      onStatsUpdate();
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const filteredPets = pets.filter(pet =>
    pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemperamentColor = (temperament) => {
    const colors = {
      calm: 'bg-green-100 text-green-800',
      friendly: 'bg-blue-100 text-blue-800',
      energetic: 'bg-yellow-100 text-yellow-800',
      nervous: 'bg-orange-100 text-orange-800',
      aggressive: 'bg-red-100 text-red-800'
    };
    return colors[temperament?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pet Profiles</h1>
          <p className="text-gray-600">Manage your client pets and their grooming history</p>
        </div>
        <button
          onClick={() => setShowAddPetModal(true)}
          className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
        >
          + Add Pet Profile
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search pets by name, breed, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
        />
      </div>

      {/* Pets Grid */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-[#5EB47C] font-semibold text-lg">
                        {pet.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-600">{pet.breed}</p>
                    </div>
                  </div>
                  {pet.temperament && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTemperamentColor(pet.temperament)}`}>
                      {pet.temperament}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="text-gray-900">{pet.owner_name}</span>
                  </div>
                  {pet.age && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="text-gray-900">{pet.age}</span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="text-gray-900">{pet.weight}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grooming Sessions:</span>
                    <span className="text-gray-900">{pet.grooming_history?.length || 0}</span>
                  </div>
                </div>

                {pet.special_needs && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      <span className="font-medium">Special Needs:</span> {pet.special_needs}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSelectedPet(pet)}
                    className="flex-1 bg-green-50 text-[#5EB47C] px-3 py-2 rounded text-sm font-medium hover:bg-green-100"
                  >
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded text-sm hover:bg-gray-100">
                    Book Grooming
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🐕</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No pets found' : 'No pet profiles yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No pets match your search for "${searchTerm}"`
              : "Start building your client base by adding pet profiles"
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddPetModal(true)}
              className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
            >
              Add Your First Pet Profile
            </button>
          )}
        </div>
      )}

      {/* Add Pet Modal */}
      {showAddPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add New Pet Profile</h2>
                <button
                  onClick={() => setShowAddPetModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                  <input
                    type="text"
                    value={newPet.name}
                    onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter pet name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breed *</label>
                  <input
                    type="text"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter breed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="text"
                    value={newPet.age}
                    onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="e.g., 2 years, 6 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({...newPet, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="e.g., 25 lbs, 11 kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    value={newPet.owner_name}
                    onChange={(e) => setNewPet({...newPet, owner_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter owner name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
                  <input
                    type="tel"
                    value={newPet.owner_phone}
                    onChange={(e) => setNewPet({...newPet, owner_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={newPet.owner_email}
                    onChange={(e) => setNewPet({...newPet, owner_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperament</label>
                  <select
                    value={newPet.temperament}
                    onChange={(e) => setNewPet({...newPet, temperament: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                  >
                    <option value="">Select temperament</option>
                    <option value="calm">Calm</option>
                    <option value="friendly">Friendly</option>
                    <option value="energetic">Energetic</option>
                    <option value="nervous">Nervous</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Services</label>
                  <input
                    type="text"
                    value={newPet.preferred_services}
                    onChange={(e) => setNewPet({...newPet, preferred_services: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="e.g., Full grooming, Bath only"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs</label>
                  <textarea
                    value={newPet.special_needs}
                    onChange={(e) => setNewPet({...newPet, special_needs: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Any allergies, medical conditions, or special requirements..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newPet.notes}
                    onChange={(e) => setNewPet({...newPet, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Additional notes about the pet..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddPetModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPet}
                  disabled={!newPet.name || !newPet.breed || !newPet.owner_name}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Pet Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-[#5EB47C] font-bold text-xl">
                      {selectedPet.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{selectedPet.name}</h2>
                    <p className="text-gray-600">{selectedPet.breed}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPet(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pet Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pet Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="text-gray-900">{selectedPet.age || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="text-gray-900">{selectedPet.weight || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperament:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTemperamentColor(selectedPet.temperament)}`}>
                        {selectedPet.temperament || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">Owner Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900">{selectedPet.owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-900">{selectedPet.owner_phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">{selectedPet.owner_email || 'Not provided'}</span>
                    </div>
                  </div>

                  {(selectedPet.special_needs || selectedPet.notes) && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {selectedPet.special_needs && (
                          <div>
                            <span className="text-gray-600 font-medium">Special Needs:</span>
                            <p className="text-gray-900 mt-1">{selectedPet.special_needs}</p>
                          </div>
                        )}
                        {selectedPet.notes && (
                          <div>
                            <span className="text-gray-600 font-medium">Notes:</span>
                            <p className="text-gray-900 mt-1">{selectedPet.notes}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Grooming History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Grooming History</h3>
                  {selectedPet.grooming_history && selectedPet.grooming_history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPet.grooming_history.map((session) => (
                        <div key={session.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{session.service_type}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(session.service_date).toLocaleDateString()}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-sm text-gray-600">{session.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="text-gray-400 text-4xl mb-2">✂️</div>
                      <p className="text-gray-500">No grooming history yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPet(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-[#5EB47C] text-white rounded hover:bg-[#4A9A64]">
                  Book Grooming
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetProfiles;