import React, { useState, useRef } from 'react';
import petService from '../services/petService';

const AddPetForm = ({ onClose, onSuccess, userId, editingPet = null }) => {
  const [formData, setFormData] = useState({
    name: editingPet?.name || '',
    species: editingPet?.species || '',
    breed: editingPet?.breed || '',
    gender: editingPet?.gender || '',
    birth_date: editingPet?.birth_date || '',
    weight: editingPet?.weight || '',
    microchip_number: editingPet?.microchip_number || '',
    special_needs: editingPet?.special_needs || '',
    allergies: editingPet?.allergies || '',
    insurance_info: editingPet?.insurance_info || {}
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(editingPet?.photo_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const speciesOptions = [
    { value: 'dog', label: 'Dog 🐕' },
    { value: 'cat', label: 'Cat 🐱' },
    { value: 'bird', label: 'Bird 🐦' },
    { value: 'rabbit', label: 'Rabbit 🐰' },
    { value: 'hamster', label: 'Hamster 🐹' },
    { value: 'fish', label: 'Fish 🐠' },
    { value: 'reptile', label: 'Reptile 🦎' },
    { value: 'other', label: 'Other 🐾' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unknown', label: 'Unknown' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Pet name is required');
      }
      if (!formData.species) {
        throw new Error('Please select a species');
      }

      // Add or update the pet
      const petResult = editingPet 
        ? await petService.updatePet(editingPet.id, formData)
        : await petService.addPet(userId, formData);
      
      if (!petResult.success) {
        throw new Error(petResult.error || `Failed to ${editingPet ? 'update' : 'add'} pet`);
      }

      let createdOrUpdatedPet = petResult.data;

      // Upload photo if provided
      if (photoFile && createdOrUpdatedPet.id) {
        console.log('Attempting to upload photo:', {
          fileName: photoFile.name,
          fileSize: photoFile.size,
          fileType: photoFile.type,
          petId: createdOrUpdatedPet.id
        });
        
        const photoResult = await petService.uploadPetPhoto(createdOrUpdatedPet.id, photoFile);
        if (!photoResult.success) {
          console.error('Photo upload failed:', photoResult.error);
          setError(`Pet added but photo upload failed: ${photoResult.error}`);
          // Don't return here, still show success for pet creation
        } else {
          console.log('Photo uploaded successfully:', photoResult);
          // Ensure caller gets the updated photo_url immediately
          createdOrUpdatedPet = { ...createdOrUpdatedPet, photo_url: photoResult.photoUrl };
        }
      }

      // Success!
      onSuccess(createdOrUpdatedPet);
      onClose();
    } catch (error) {
      console.error('Error adding pet:', error);
      setError(error.message || 'Failed to add pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesEmoji = (species) => {
    const option = speciesOptions.find(opt => opt.value === species);
    return option ? option.label.split(' ')[1] : '🐾';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-montserrat">
                {editingPet ? 'Edit Pet' : 'Add New Pet'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingPet ? 'Update your pet\'s information' : 'Add your furry, feathered, or scaled family member'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              disabled={loading}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pet Photo</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Pet preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl">{formData.species ? getSpeciesEmoji(formData.species) : '📷'}</span>
                    </div>
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      fileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium"
                >
                  Choose Photo
                </button>
                <p className="text-xs text-gray-500 mt-1">Optional. Max 5MB. JPG, PNG, or GIF.</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="e.g., Buddy, Luna, Charlie"
                required
              />
            </div>

            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
                Species *
              </label>
              <select
                id="species"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                required
              >
                <option value="">Select species</option>
                {speciesOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="e.g., Golden Retriever, Persian"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              >
                <option value="">Select gender</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="e.g., 25.5"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label htmlFor="microchip_number" className="block text-sm font-medium text-gray-700 mb-1">
              Microchip Number
            </label>
            <input
              type="text"
              id="microchip_number"
              name="microchip_number"
              value={formData.microchip_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              placeholder="15-digit microchip number"
            />
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              placeholder="List any known allergies (food, environmental, medications)"
            />
          </div>

          <div>
            <label htmlFor="special_needs" className="block text-sm font-medium text-gray-700 mb-1">
              Special Needs
            </label>
            <textarea
              id="special_needs"
              name="special_needs"
              value={formData.special_needs}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              placeholder="Any special care requirements, medical conditions, or behavioral notes"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.species}
              className="px-6 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingPet ? 'Updating Pet...' : 'Adding Pet...'}
                </>
              ) : (
                editingPet ? 'Update Pet' : 'Add Pet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPetForm;