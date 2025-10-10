import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import notificationService from '../services/notificationService';

const ConsultationBooking = ({ service, provider, onClose }) => {
  const [bookingData, setBookingData] = useState({
    consultationType: 'general',
    preferredDate: '',
    preferredTime: '',
    petName: '',
    petAge: '',
    petSpecies: '',
    consultationReason: '',
    urgency: 'routine',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Dropdown states
  const [consultationTypeOpen, setConsultationTypeOpen] = useState(false);
  const [timeSlotOpen, setTimeSlotOpen] = useState(false);
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  
  // Refs for dropdowns
  const consultationTypeRef = useRef(null);
  const timeSlotRef = useRef(null);
  const speciesRef = useRef(null);
  const urgencyRef = useRef(null);

  const consultationTypes = [
    { value: 'general', label: 'General Health Consultation' },
    { value: 'follow_up', label: 'Follow-up Appointment' },
    { value: 'prescription', label: 'Prescription Review' },
    { value: 'nutrition', label: 'Nutrition Consultation' },
    { value: 'behavior', label: 'Behavioral Consultation' },
    { value: 'second_opinion', label: 'Second Opinion' }
  ];

  const urgencyLevels = [
    { value: 'routine', label: 'Routine (within 1-2 weeks)' },
    { value: 'priority', label: 'Priority (within 2-3 days)' },
    { value: 'urgent', label: 'Urgent (within 24 hours)' }
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (consultationTypeRef.current && !consultationTypeRef.current.contains(event.target)) {
        setConsultationTypeOpen(false);
      }
      if (timeSlotRef.current && !timeSlotRef.current.contains(event.target)) {
        setTimeSlotOpen(false);
      }
      if (speciesRef.current && !speciesRef.current.contains(event.target)) {
        setSpeciesOpen(false);
      }
      if (urgencyRef.current && !urgencyRef.current.contains(event.target)) {
        setUrgencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create consultation booking
      const { data: bookingResult, error: bookingError } = await supabase
        .from('consultation_bookings')
        .insert([
          {
            service_id: service.id,
            provider_id: provider.id,
            consultation_type: bookingData.consultationType,
            preferred_date: bookingData.preferredDate,
            preferred_time: bookingData.preferredTime,
            pet_name: bookingData.petName,
            pet_age: parseInt(bookingData.petAge),
            pet_species: bookingData.petSpecies,
            consultation_reason: bookingData.consultationReason,
            urgency: bookingData.urgency,
            customer_name: bookingData.customerName,
            customer_email: bookingData.customerEmail,
            customer_phone: bookingData.customerPhone,
            additional_notes: bookingData.additionalNotes,
            status: 'pending',
            total_amount: service.price,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (bookingError) {
        setError('Failed to book consultation. Please try again.');
        setLoading(false);
        return;
      }

      // Get provider availability settings for notifications
      const { data: providerAvailability } = await supabase
        .from('provider_availability')
        .select('notification_settings')
        .eq('provider_id', provider.id)
        .single();

      // Send notifications to provider
      if (providerAvailability?.notification_settings) {
        try {
          const bookingDataForNotification = {
            id: bookingResult.id,
            pet_name: bookingData.petName,
            pet_type: bookingData.petSpecies,
            pet_age: bookingData.petAge,
            consultation_type: bookingData.consultationType,
            preferred_date: bookingData.preferredDate,
            preferred_time: bookingData.preferredTime,
            consultation_notes: bookingData.consultationReason,
            customer_name: bookingData.customerName,
            customer_phone: bookingData.customerPhone,
            customer_email: bookingData.customerEmail,
            duration: 30 // Default duration
          };

          await notificationService.sendBookingNotification(
            bookingDataForNotification,
            provider,
            providerAvailability.notification_settings
          );

        
        } catch (notificationError) {
          // Notification sending failed - handled gracefully
          // Don't fail the booking if notifications fail
        }
      }

      setSuccess(true);
      setLoading(false);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-montserrat mb-2">
              Consultation Booked Successfully!
            </h3>
            <p className="text-sm text-gray-500 font-montserrat">
              {provider.name} will contact you within 24 hours to confirm your appointment time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 font-montserrat">
            Book Online Consultation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-base font-montserrat">
              {provider.name.charAt(0)}
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-900 font-montserrat">{provider.name}</h4>
              <p className="text-sm text-gray-500 font-montserrat">{service.title}</p>
              <p className="text-xl font-bold text-primary-600 font-montserrat">${service.price}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-montserrat text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Consultation Type */}
          <div ref={consultationTypeRef}>
            <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
              Consultation Type *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setConsultationTypeOpen(!consultationTypeOpen)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
              >
                <span>
                  {consultationTypes.find(type => type.value === bookingData.consultationType)?.label || 'Select consultation type'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${consultationTypeOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {consultationTypeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {consultationTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setBookingData({...bookingData, consultationType: type.value});
                        setConsultationTypeOpen(false);
                      }}
                      className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                        bookingData.consultationType === type.value ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                      } ${type.value !== consultationTypes[0].value ? 'border-t border-gray-200' : ''}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                Preferred Date *
              </label>
              <input
                type="date"
                name="preferredDate"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.preferredDate}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
              />
            </div>
            <div ref={timeSlotRef}>
              <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                Preferred Time *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTimeSlotOpen(!timeSlotOpen)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
                >
                  <span>
                    {bookingData.preferredTime || 'Select time'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${timeSlotOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {timeSlotOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingData({...bookingData, preferredTime: ''});
                        setTimeSlotOpen(false);
                      }}
                      className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                        !bookingData.preferredTime ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                      }`}
                    >
                      Select time
                    </button>
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setBookingData({...bookingData, preferredTime: time});
                          setTimeSlotOpen(false);
                        }}
                        className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center border-t border-gray-200 font-montserrat ${
                          bookingData.preferredTime === time ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pet Information */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 font-montserrat mb-4">Pet Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                  Pet Name *
                </label>
                <input
                  type="text"
                  name="petName"
                  required
                  value={bookingData.petName}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
                  placeholder="e.g., Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                  Age (years) *
                </label>
                <input
                  type="number"
                  name="petAge"
                  required
                  min="0"
                  max="30"
                  value={bookingData.petAge}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
                />
              </div>
              <div ref={speciesRef}>
                <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                  Species *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSpeciesOpen(!speciesOpen)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
                  >
                    <span>
                      {bookingData.petSpecies || 'Select species'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${speciesOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {speciesOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {['', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Guinea Pig', 'Hamster', 'Fish', 'Reptile', 'Other'].map((species, index) => (
                        <button
                          key={species || 'empty'}
                          type="button"
                          onClick={() => {
                            setBookingData({...bookingData, petSpecies: species});
                            setSpeciesOpen(false);
                          }}
                          className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                            bookingData.petSpecies === species ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                          } ${index > 0 ? 'border-t border-gray-200' : ''}`}
                        >
                          {species || 'Select species'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
              Reason for Consultation *
            </label>
            <textarea
              name="consultationReason"
              required
              rows={3}
              value={bookingData.consultationReason}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
              placeholder="Please describe your pet's symptoms or the reason for this consultation..."
            />
          </div>

          {/* Urgency */}
          <div ref={urgencyRef}>
            <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
              Urgency Level *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUrgencyOpen(!urgencyOpen)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
              >
                <span>
                  {urgencyLevels.find(level => level.value === bookingData.urgency)?.label || 'Select urgency level'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${urgencyOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {urgencyOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {urgencyLevels.map((level, index) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => {
                        setBookingData({...bookingData, urgency: level.value});
                        setUrgencyOpen(false);
                      }}
                      className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                        bookingData.urgency === level.value ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                      } ${index > 0 ? 'border-t border-gray-200' : ''}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 font-montserrat mb-4">Your Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={bookingData.customerName}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  value={bookingData.customerPhone}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                required
                value={bookingData.customerEmail}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              rows={2}
              value={bookingData.additionalNotes}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-montserrat"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium font-montserrat hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium font-montserrat hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </div>
              ) : (
                `Book Consultation - $${service.price}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;