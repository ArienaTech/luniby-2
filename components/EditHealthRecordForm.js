import React, { useState, useRef } from 'react';
import healthRecordService from '../services/healthRecordService';
import { HealthIcon, UIIcon } from './MinimalIcons';

const EditHealthRecordForm = ({ record, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    record_type: record?.record_type || 'checkup',
    title: record?.title || '',
    description: record?.description || '',
    vet_name: record?.vet_name || '',
    clinic_name: record?.clinic_name || '',
    date_performed: record?.date_performed ? record.date_performed.split('T')[0] : new Date().toISOString().split('T')[0],
    next_due_date: record?.next_due_date ? record.next_due_date.split('T')[0] : '',
    cost: record?.cost || '',
    notes: record?.notes || ''
  });
  
  const [documents, setDocuments] = useState(record?.documents || []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const recordTypes = [
    { value: 'checkup', label: 'Regular Checkup', icon: <HealthIcon type="check" className="w-5 h-5" color="currentColor" />, textIcon: '⚕️' },
    { value: 'vaccination', label: 'Vaccination', icon: <HealthIcon type="vaccination" className="w-5 h-5" color="currentColor" />, textIcon: '💉' },
    { value: 'surgery', label: 'Surgery', icon: <UIIcon type="surgery" className="w-5 h-5" color="currentColor" />, textIcon: '🏥' },
    { value: 'emergency', label: 'Emergency Visit', icon: <HealthIcon type="emergency" className="w-5 h-5" color="currentColor" />, textIcon: '🚨' },
    { value: 'dental', label: 'Dental Care', icon: <HealthIcon type="dental" className="w-5 h-5" color="currentColor" />, textIcon: '🦷' },
    { value: 'grooming', label: 'Grooming', icon: <UIIcon type="scissors" className="w-5 h-5" color="currentColor" />, textIcon: '✂️' },
    { value: 'lab_work', label: 'Lab Work', icon: <HealthIcon type="lab" className="w-5 h-5" color="currentColor" />, textIcon: '🔬' },
    { value: 'other', label: 'Other', icon: <HealthIcon type="records" className="w-5 h-5" color="currentColor" />, textIcon: '📋' }
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
          throw new Error(`Invalid file type: ${file.type}. Please upload PDF, JPG, or PNG files only.`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        const result = await healthRecordService.uploadVetReport(record.pet_id, file, 'health_record');
        if (!result.success) {
          throw new Error(`Failed to upload ${file.name}: ${result.error}`);
        }
        return result.data;
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      setDocuments(prev => [...prev, ...uploadedDocs]);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const recordData = {
        ...formData,
        documents: documents,
        updated_at: new Date().toISOString()
      };

      const result = await healthRecordService.updateHealthRecord(record.id, recordData);
      
      if (result.success) {
        alert('Health record updated successfully!');
        if (onSuccess) {
          onSuccess(result.data);
        }
        onClose();
      } else {
        setError(`Failed to update health record: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating health record:', error);
      setError(`Error updating health record: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Health Record</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Record Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Type
              </label>
              <select
                name="record_type"
                value={formData.record_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                required
              >
                {recordTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.textIcon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={currentConfig.titlePlaceholder}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder={currentConfig.descriptionPlaceholder}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                required
              />
            </div>

            {/* Vet and Clinic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentConfig.professionalLabel}
                </label>
                <input
                  type="text"
                  name="vet_name"
                  value={formData.vet_name}
                  onChange={handleInputChange}
                  placeholder={currentConfig.professionalPlaceholder}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentConfig.businessLabel}
                </label>
                <input
                  type="text"
                  name="clinic_name"
                  value={formData.clinic_name}
                  onChange={handleInputChange}
                  placeholder={currentConfig.businessPlaceholder}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Performed *
                </label>
                <input
                  type="date"
                  name="date_performed"
                  value={formData.date_performed}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  required
                />
              </div>
              
              {currentConfig.showNextDueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentConfig.nextDueDateLabel}
                  </label>
                  <input
                    type="date"
                    name="next_due_date"
                    value={formData.next_due_date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost ($)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes or observations..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#5EB47C] bg-green-50 hover:bg-green-100 disabled:opacity-50"
                  >
                    <HealthIcon type="attachment" className="w-4 h-4 mr-2" color="currentColor" />
                    {uploading ? 'Uploading...' : 'Add Documents'}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    PDF, JPG, PNG files up to 10MB each
                  </p>
                </div>
              </div>

              {/* Show existing documents */}
              {documents.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</p>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-sm flex items-center">
                            <HealthIcon type="document" className="w-4 h-4 mr-1" color="currentColor" />
                            {doc.name}
                          </span>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              View
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-[#5EB47C] text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Health Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHealthRecordForm;