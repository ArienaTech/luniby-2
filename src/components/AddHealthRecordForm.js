import React, { useState, useRef } from 'react';
import healthRecordService from '../services/healthRecordService';
import { HealthIcon, UIIcon } from './MinimalIcons';

const AddHealthRecordForm = ({ petId, petName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    record_type: 'checkup',
    title: '',
    description: '',
    vet_name: '',
    clinic_name: '',
    date_performed: new Date().toISOString().split('T')[0],
    next_due_date: '',
    cost: '',
    notes: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const recordTypes = [
    { value: 'checkup', label: 'Regular Checkup', icon: <HealthIcon type="check" className="w-5 h-5" color="currentColor" /> },
    { value: 'vaccination', label: 'Vaccination', icon: <HealthIcon type="vaccination" className="w-5 h-5" color="currentColor" /> },
    { value: 'surgery', label: 'Surgery', icon: <UIIcon type="surgery" className="w-5 h-5" color="currentColor" /> },
    { value: 'emergency', label: 'Emergency Visit', icon: <HealthIcon type="emergency" className="w-5 h-5" color="currentColor" /> },
    { value: 'dental', label: 'Dental Care', icon: <UIIcon type="dental" className="w-5 h-5" color="currentColor" /> },
    { value: 'grooming', label: 'Grooming', icon: <UIIcon type="scissors" className="w-5 h-5" color="currentColor" /> },
    { value: 'lab_work', label: 'Lab Work', icon: <UIIcon type="lab" className="w-5 h-5" color="currentColor" /> },
    { value: 'other', label: 'Other', icon: <HealthIcon type="records" className="w-5 h-5" color="currentColor" /> }
  ];

  // Dynamic field configurations based on record type
  const getFieldConfig = (recordType) => {
    const configs = {
      grooming: {
        professionalLabel: 'Groomer Name',
        professionalPlaceholder: 'e.g., Sarah Smith',
        businessLabel: 'Salon/Shop Name',
        businessPlaceholder: 'e.g., Pampered Paws Grooming',
        titlePlaceholder: 'e.g., Full Grooming Service, Nail Trim',
        descriptionPlaceholder: 'Describe the grooming services performed...',
        nextDueDateLabel: 'Next Grooming Due',
        showNextDueDate: true
      },
      checkup: {
        professionalLabel: 'Veterinarian Name',
        professionalPlaceholder: 'e.g., Dr. Smith',
        businessLabel: 'Clinic/Hospital Name',
        businessPlaceholder: 'e.g., Pet Care Clinic',
        titlePlaceholder: 'e.g., Annual Checkup, Wellness Exam',
        descriptionPlaceholder: 'Describe the examination findings and recommendations...',
        nextDueDateLabel: 'Next Checkup Due',
        showNextDueDate: true
      },
      vaccination: {
        professionalLabel: 'Veterinarian Name',
        professionalPlaceholder: 'e.g., Dr. Smith',
        businessLabel: 'Clinic/Hospital Name',
        businessPlaceholder: 'e.g., Pet Care Clinic',
        titlePlaceholder: 'e.g., Rabies Vaccination, DHPP Booster',
        descriptionPlaceholder: 'Specify vaccine type, batch number, and any reactions...',
        nextDueDateLabel: 'Next Vaccination Due',
        showNextDueDate: true
      },
      surgery: {
        professionalLabel: 'Surgeon/Veterinarian Name',
        professionalPlaceholder: 'e.g., Dr. Johnson',
        businessLabel: 'Hospital/Clinic Name',
        businessPlaceholder: 'e.g., Animal Surgery Center',
        titlePlaceholder: 'e.g., Spay Surgery, Tumor Removal',
        descriptionPlaceholder: 'Describe the surgical procedure and post-op care...',
        nextDueDateLabel: 'Follow-up Appointment',
        showNextDueDate: true
      },
      emergency: {
        professionalLabel: 'Attending Veterinarian',
        professionalPlaceholder: 'e.g., Dr. Emergency',
        businessLabel: 'Emergency Clinic Name',
        businessPlaceholder: 'e.g., 24/7 Animal Emergency',
        titlePlaceholder: 'e.g., Emergency Visit - Injury, Poisoning',
        descriptionPlaceholder: 'Describe the emergency situation and treatment...',
        nextDueDateLabel: 'Follow-up Required',
        showNextDueDate: true
      },
      dental: {
        professionalLabel: 'Veterinarian Name',
        professionalPlaceholder: 'e.g., Dr. Smith',
        businessLabel: 'Clinic/Hospital Name',
        businessPlaceholder: 'e.g., Pet Dental Care',
        titlePlaceholder: 'e.g., Dental Cleaning, Tooth Extraction',
        descriptionPlaceholder: 'Describe the dental procedure and findings...',
        nextDueDateLabel: 'Next Dental Care Due',
        showNextDueDate: true
      },
      lab_work: {
        professionalLabel: 'Veterinarian/Technician Name',
        professionalPlaceholder: 'e.g., Dr. Smith',
        businessLabel: 'Lab/Clinic Name',
        businessPlaceholder: 'e.g., Pet Diagnostics Lab',
        titlePlaceholder: 'e.g., Blood Work, Urinalysis, X-Ray',
        descriptionPlaceholder: 'Describe the tests performed and results...',
        nextDueDateLabel: 'Next Lab Work Due',
        showNextDueDate: false
      },
      other: {
        professionalLabel: 'Professional Name',
        professionalPlaceholder: 'e.g., Professional Name',
        businessLabel: 'Business/Facility Name',
        businessPlaceholder: 'e.g., Business Name',
        titlePlaceholder: 'e.g., Treatment or Service Name',
        descriptionPlaceholder: 'Describe the service or treatment...',
        nextDueDateLabel: 'Next Appointment/Service',
        showNextDueDate: false
      }
    };

    return configs[recordType] || configs.other;
  };

  const currentConfig = getFieldConfig(formData.record_type);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a supported type. Please upload PDF, JPEG, or PNG files.`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        const result = await healthRecordService.uploadVetReport(petId, file, formData.record_type);
        if (!result.success) {
          throw new Error(`Failed to upload ${file.name}: ${result.error}`);
        }

        return {
          name: file.name,
          url: result.publicUrl,
          filePath: result.filePath,
          type: file.type,
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setDocuments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = async (index) => {
    const document = documents[index];
    
    try {
      // Delete from storage
      const result = await healthRecordService.deleteVetReport(document.filePath);
      if (!result.success) {
        console.warn('Failed to delete file from storage:', result.error);
      }
    } catch (error) {
      console.warn('Error deleting file:', error);
    }

    // Remove from local state
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.date_performed) {
        throw new Error('Date performed is required');
      }

      // Prepare health record data
      const recordData = {
        ...formData,
        documents: documents.map(doc => ({
          name: doc.name,
          url: doc.url,
          type: doc.type,
          size: doc.size
        }))
      };

      const result = await healthRecordService.addHealthRecord(petId, recordData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add health record');
      }

      onSuccess(result.data);
      onClose();
    } catch (error) {
      console.error('Error adding health record:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <HealthIcon type="image" className="w-4 h-4" color="currentColor" />;
    if (type === 'application/pdf') return <HealthIcon type="document" className="w-4 h-4" color="currentColor" />;
    return <HealthIcon type="attachment" className="w-4 h-4" color="currentColor" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-montserrat">Add Health Record</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new health record for {petName}</p>
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

          {/* Record Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Record Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recordTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'record_type', value: type.value } })}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.record_type === type.value
                      ? 'border-[#5EB47C] bg-[#E5F4F1] text-[#5EB47C]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-1 flex justify-center">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            {/* Title and Date - Always in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  placeholder={currentConfig.titlePlaceholder}
                  required
                />
              </div>

              <div>
                <label htmlFor="date_performed" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Performed *
                </label>
                <input
                  type="date"
                  id="date_performed"
                  name="date_performed"
                  value={formData.date_performed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Professional and Business Info - Always in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vet_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {currentConfig.professionalLabel}
                </label>
                <input
                  type="text"
                  id="vet_name"
                  name="vet_name"
                  value={formData.vet_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  placeholder={currentConfig.professionalPlaceholder}
                />
              </div>

              <div>
                <label htmlFor="clinic_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {currentConfig.businessLabel}
                </label>
                <input
                  type="text"
                  id="clinic_name"
                  name="clinic_name"
                  value={formData.clinic_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  placeholder={currentConfig.businessPlaceholder}
                />
              </div>
            </div>

            {/* Next Due Date and Cost - Conditional layout */}
            <div className={`grid grid-cols-1 ${currentConfig.showNextDueDate ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
              {currentConfig.showNextDueDate && (
                <div>
                  <label htmlFor="next_due_date" className="block text-sm font-medium text-gray-700 mb-1">
                    {currentConfig.nextDueDateLabel}
                  </label>
                  <input
                    type="date"
                    id="next_due_date"
                    name="next_due_date"
                    value={formData.next_due_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Cost ($)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              placeholder={currentConfig.descriptionPlaceholder}
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vet Reports & Documents
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload vet reports, lab results, or images
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PDF, JPEG, PNG up to 10MB each
                    </span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Choose Files'}
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getFileIcon(doc.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              placeholder="Any additional notes or observations..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !formData.title.trim() || !formData.date_performed}
              className="px-6 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Record...
                </>
              ) : (
                'Add Health Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHealthRecordForm;