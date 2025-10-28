import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import petService from '../services/petService';
import PetProfileCard from './PetProfileCard';
import AddPetForm from './AddPetForm';

const PetsList = ({ onPetSelect, selectedPetId = null }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserAndPets();
  }, []);

  const loadUserAndPets = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Please sign in to view your pets');
        setLoading(false);
        return;
      }

      setUser(user);
      await loadPets(user.id);
    } catch (error) {
      console.error('Error loading user and pets:', error);
      setError('Failed to load pets');
      setLoading(false);
    }
  };

  const loadPets = async (userId) => {
    try {
      setLoading(true);
      const result = await petService.getUserPets(userId);
      
      if (result.success) {
        setPets(result.data);
        setError('');
      } else {
        setError(result.error || 'Failed to load pets');
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      setError('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = () => {
    setShowAddForm(true);
    setEditingPet(null);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setShowAddForm(true);
  };

  const handleDeletePet = async (petId) => {
    // Confirm destructive action with explicit warning about associated data/files
    const pet = pets.find(p => p.id === petId);
    const petName = pet?.name || 'this pet';
    const confirmed = window.confirm(`Delete ${petName}? This removes all data and files. This cannot be undone.`);
    if (!confirmed) return;

    try {
      const result = await petService.deletePetCascade(petId);
      
      if (result.success) {
        setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
        
        // If the deleted pet was selected, clear selection
        if (selectedPetId === petId && onPetSelect) {
          onPetSelect(null);
        }
      } else {
        alert('Failed to delete pet: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet. Please try again.');
    }
  };

  const handleFormSuccess = (newPet) => {
    if (editingPet) {
      // Update existing pet
      setPets(prevPets => 
        prevPets.map(pet => pet.id === editingPet.id ? newPet : pet)
      );
    } else {
      // Add new pet
      setPets(prevPets => [newPet, ...prevPets]);
    }
    setShowAddForm(false);
    setEditingPet(null);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingPet(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadUserAndPets}
          className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-montserrat">My Pets</h2>
          <p className="text-gray-600 mt-1">
            {pets.length === 0 
              ? "Add your first pet to get started" 
              : `Managing ${pets.length} pet${pets.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button
          onClick={handleAddPet}
          className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors flex items-center font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Pet
        </button>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🐾</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start by adding your first pet. You can track their health records, 
            vaccinations, medications, and book services all in one place.
          </p>
          <button
            onClick={handleAddPet}
            className="bg-[#5EB47C] text-white px-6 py-3 rounded-lg hover:bg-[#4A9A64] transition-colors font-medium"
          >
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetProfileCard
              key={pet.id}
              pet={pet}
              onEdit={handleEditPet}
              onDelete={handleDeletePet}
              onSelect={onPetSelect}
              isSelected={selectedPetId === pet.id}
            />
          ))}
        </div>
      )}

      {/* Pet Statistics */}
      {pets.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#5EB47C]">{pets.length}</p>
              <p className="text-sm text-gray-600">Total Pets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {pets.filter(pet => pet.species === 'dog').length}
              </p>
              <p className="text-sm text-gray-600">Dogs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {pets.filter(pet => pet.species === 'cat').length}
              </p>
              <p className="text-sm text-gray-600">Cats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {pets.filter(pet => !['dog', 'cat'].includes(pet.species)).length}
              </p>
              <p className="text-sm text-gray-600">Other</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Pet Form Modal */}
      {showAddForm && user && (
        <AddPetForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          userId={user.id}
          editingPet={editingPet}
        />
      )}
      

    </div>
  );
};

export default PetsList;