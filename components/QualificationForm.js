import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useNotificationContext } from '../contexts/NotificationContext';

const QualificationForm = ({ 
  providerData, 
  onClose, 
  onSubmissionComplete 
}) => {
  const { showInfo } = useNotificationContext();
  const [formData, setFormData] = useState({
    license_number: '',
    qualification_type: '',
    institution: '',
    graduation_year: '',
    experience_years: '',
    specializations: '',
    additional_notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert qualification submission
      const { data, error } = await supabase
        .from('provider_qualifications')
        .insert({
          provider_id: user.id,
          provider_email: providerData.email,
          provider_name: providerData.name,
          provider_type: providerData.provider_type,
          license_number: formData.license_number || null,
          qualification_type: formData.qualification_type,
          institution: formData.institution,
          graduation_year: parseInt(formData.graduation_year),
          experience_years: parseInt(formData.experience_years),
          specializations: formData.specializations || null,
          additional_notes: formData.additional_notes || null,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .select();

      if (error) {
        showInfo('Failed to submit qualifications. Please try again.', 'error');
        return;
      }

      showInfo('Qualifications submitted successfully! Admin will review within 2-3 business days.', 'success');
      onSubmissionComplete(data[0]);
      onClose();

      // Send notification to admin
      try {
        const emailService = await import('../lib/email-service.js');
        await emailService.default.sendAdminQualificationNotification({
          provider_name: providerData.name,
          provider_email: providerData.email,
          provider_type: providerData.provider_type,
          license_number: formData.license_number || 'Not provided',
          qualification_type: formData.qualification_type,
          institution: formData.institution,
          experience_years: formData.experience_years,
          submitted_at: new Date().toISOString()
        });
      } catch (emailError) {
        // Failed to send admin notification
      }

    } catch (error) {
      showInfo('Failed to submit qualifications. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [formData, providerData, showInfo, onClose, onSubmissionComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit Your Qualifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License/Registration Number <span className="text-gray-500 font-normal">(if applicable)</span>
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => updateFormData('license_number', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="e.g., WA: VN12345, VNCA: AVNAT123, or leave blank if not required in your state"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification Type *
              </label>
              <select
                required
                value={formData.qualification_type}
                onChange={(e) => updateFormData('qualification_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              >
                <option value="">Select qualification</option>
                <option value="Certificate IV in Veterinary Nursing">Certificate IV in Veterinary Nursing</option>
                <option value="Diploma of Veterinary Nursing">Diploma of Veterinary Nursing</option>
                <option value="Bachelor of Veterinary Science">Bachelor of Veterinary Science</option>
                <option value="Veterinary Nurse Registration">Veterinary Nurse Registration</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution *
              </label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => updateFormData('institution', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="e.g., TAFE NSW, Massey University"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Graduation Year *
              </label>
              <input
                type="number"
                required
                min="1980"
                max={new Date().getFullYear()}
                value={formData.graduation_year}
                onChange={(e) => updateFormData('graduation_year', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="2020"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                required
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) => updateFormData('experience_years', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="3"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </label>
              <input
                type="text"
                value={formData.specializations}
                onChange={(e) => updateFormData('specializations', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                placeholder="e.g., Surgery, Emergency Care, Dental"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows="4"
              value={formData.additional_notes}
              onChange={(e) => updateFormData('additional_notes', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              placeholder="Any additional information about your qualifications, certifications, or experience..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📋 Required Documents</h4>
            <p className="text-sm text-blue-700">
              Please prepare digital copies of your license and certificates. 
              You can upload them after submitting this form or email them to hello@luniby.com 
              with your license number as reference.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Qualifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QualificationForm;