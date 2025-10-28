import React, { useState, useEffect } from 'react';
import medicalHistoryService from '../services/medicalHistoryService';
import { useNotificationContext } from '../contexts/NotificationContext';

const MedicalHistoryManager = ({ pet, onClose, onUpdate }) => {
  const { showSuccess, showError } = useNotificationContext();
  
  // Main medical history state
  const [medicalData, setMedicalData] = useState({
    medical_alerts: [],
    chronic_conditions: [],
    current_medications: [],
    vaccination_status: {},
    previous_surgeries: [],
    behavioral_notes: '',
    dietary_restrictions: [],
    emergency_contacts: [],
    preferred_vet: {},
    last_checkup_date: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [timeline, setTimeline] = useState([]);

  // Form states for adding new items
  const [newCondition, setNewCondition] = useState({
    condition_name: '',
    condition_type: 'chronic',
    severity: 'moderate',
    diagnosed_date: '',
    diagnosed_by: '',
    status: 'active',
    treatment_plan: '',
    notes: ''
  });

  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    start_date: '',
    prescribed_by: '',
    indication: '',
    special_instructions: ''
  });

  const [newAlert, setNewAlert] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');

  // Load existing medical data
  useEffect(() => {
    if (pet?.id) {
      loadMedicalData();
      loadTimeline();
    }
  }, [pet?.id]);

  const loadMedicalData = async () => {
    try {
      const result = await medicalHistoryService.getQuickMedicalSummary(pet.id);
      if (result.success && result.data) {
        setMedicalData({
          medical_alerts: result.data.medical_alerts || [],
          chronic_conditions: result.data.chronic_conditions || [],
          current_medications: result.data.current_medications || [],
          vaccination_status: result.data.vaccination_status || {},
          previous_surgeries: pet.previous_surgeries || [],
          behavioral_notes: pet.behavioral_notes || '',
          dietary_restrictions: pet.dietary_restrictions || [],
          emergency_contacts: pet.emergency_contacts || [],
          preferred_vet: pet.preferred_vet || {},
          last_checkup_date: result.data.last_checkup_date || ''
        });
      }
    } catch (error) {
      console.error('Error loading medical data:', error);
      showError('Failed to load medical history');
    }
  };

  const loadTimeline = async () => {
    try {
      const result = await medicalHistoryService.getMedicalTimeline(pet.id, 10);
      if (result.success) {
        setTimeline(result.data);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  // Save medical history
  const saveMedicalHistory = async () => {
    setLoading(true);
    try {
      const result = await medicalHistoryService.updatePetMedicalHistory(pet.id, medicalData);
      if (result.success) {
        showSuccess('Medical history updated successfully');
        onUpdate && onUpdate(result.data);
      } else {
        showError('Failed to update medical history: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving medical history:', error);
      showError('Failed to save medical history');
    } finally {
      setLoading(false);
    }
  };

  // Add medical condition
  const addMedicalCondition = async () => {
    if (!newCondition.condition_name.trim()) {
      showError('Please enter a condition name');
      return;
    }

    try {
      const result = await medicalHistoryService.addMedicalCondition(
        pet.id,
        pet.owner_id,
        newCondition
      );

      if (result.success) {
        setMedicalData(prev => ({
          ...prev,
          chronic_conditions: [...prev.chronic_conditions, result.data]
        }));
        setNewCondition({
          condition_name: '',
          condition_type: 'chronic',
          severity: 'moderate',
          diagnosed_date: '',
          diagnosed_by: '',
          status: 'active',
          treatment_plan: '',
          notes: ''
        });
        setShowAddCondition(false);
        showSuccess('Medical condition added successfully');
        loadTimeline(); // Refresh timeline
      } else {
        showError('Failed to add condition: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding condition:', error);
      showError('Failed to add medical condition');
    }
  };

  // Add current medication
  const addCurrentMedication = async () => {
    if (!newMedication.medication_name.trim() || !newMedication.dosage.trim()) {
      showError('Please enter medication name and dosage');
      return;
    }

    try {
      const result = await medicalHistoryService.addCurrentMedication(
        pet.id,
        pet.owner_id,
        newMedication
      );

      if (result.success) {
        setMedicalData(prev => ({
          ...prev,
          current_medications: [...prev.current_medications, result.data]
        }));
        setNewMedication({
          medication_name: '',
          dosage: '',
          frequency: '',
          route: 'oral',
          start_date: '',
          prescribed_by: '',
          indication: '',
          special_instructions: ''
        });
        setShowAddMedication(false);
        showSuccess('Medication added successfully');
        loadTimeline(); // Refresh timeline
      } else {
        showError('Failed to add medication: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      showError('Failed to add medication');
    }
  };

  // Add medical alert
  const addMedicalAlert = () => {
    if (!newAlert.trim()) return;
    
    setMedicalData(prev => ({
      ...prev,
      medical_alerts: [...prev.medical_alerts, newAlert.trim()]
    }));
    setNewAlert('');
  };

  // Remove medical alert
  const removeMedicalAlert = (index) => {
    setMedicalData(prev => ({
      ...prev,
      medical_alerts: prev.medical_alerts.filter((_, i) => i !== index)
    }));
  };

  // Add dietary restriction
  const addDietaryRestriction = () => {
    if (!newDietaryRestriction.trim()) return;
    
    setMedicalData(prev => ({
      ...prev,
      dietary_restrictions: [...prev.dietary_restrictions, newDietaryRestriction.trim()]
    }));
    setNewDietaryRestriction('');
  };

  // Remove dietary restriction
  const removeDietaryRestriction = (index) => {
    setMedicalData(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'overview', label: '📋 Overview', icon: '📋' },
    { id: 'conditions', label: '🏥 Conditions', icon: '🏥' },
    { id: 'medications', label: '💊 Medications', icon: '💊' },
    { id: 'alerts', label: '🚨 Alerts & Diet', icon: '🚨' },
    { id: 'timeline', label: '📅 Timeline', icon: '📅' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Pet Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-blue-700">Name:</span>
            <p className="text-blue-900">{pet?.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-700">Species:</span>
            <p className="text-blue-900">{pet?.species} ({pet?.breed})</p>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-700">Age:</span>
            <p className="text-blue-900">
              {pet?.birth_date ? Math.floor((new Date() - new Date(pet.birth_date)) / (1000 * 60 * 60 * 24 * 365.25)) : 'Unknown'} years
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-700">Weight:</span>
            <p className="text-blue-900">{pet?.weight || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Last Checkup */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Last Veterinary Checkup
        </label>
        <input
          type="date"
          value={medicalData.last_checkup_date}
          onChange={(e) => setMedicalData(prev => ({
            ...prev,
            last_checkup_date: e.target.value
          }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Behavioral Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Behavioral Notes
        </label>
        <textarea
          value={medicalData.behavioral_notes}
          onChange={(e) => setMedicalData(prev => ({
            ...prev,
            behavioral_notes: e.target.value
          }))}
          placeholder="Any behavioral quirks, fears, or special handling instructions..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
        />
      </div>

      {/* Preferred Vet */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Veterinarian
          </label>
          <input
            type="text"
            value={medicalData.preferred_vet.name || ''}
            onChange={(e) => setMedicalData(prev => ({
              ...prev,
              preferred_vet: { ...prev.preferred_vet, name: e.target.value }
            }))}
            placeholder="Dr. Smith"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinic Name
          </label>
          <input
            type="text"
            value={medicalData.preferred_vet.clinic || ''}
            onChange={(e) => setMedicalData(prev => ({
              ...prev,
              preferred_vet: { ...prev.preferred_vet, clinic: e.target.value }
            }))}
            placeholder="Pet Care Clinic"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderConditions = () => (
    <div className="space-y-4">
      {/* Existing Conditions */}
      <div className="space-y-3">
        {medicalData.chronic_conditions.length > 0 ? (
          medicalData.chronic_conditions.map((condition, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900">
                    {condition.condition_name || condition}
                  </h4>
                  {condition.severity && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      condition.severity === 'severe' ? 'bg-red-100 text-red-800' :
                      condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {condition.severity}
                    </span>
                  )}
                  {condition.diagnosed_date && (
                    <p className="text-sm text-yellow-700 mt-1">
                      Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No medical conditions recorded</p>
        )}
      </div>

      {/* Add New Condition */}
      <div className="border-t pt-4">
        {!showAddCondition ? (
          <button
            onClick={() => setShowAddCondition(true)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Medical Condition
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold">Add New Medical Condition</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition Name *
                </label>
                <input
                  type="text"
                  value={newCondition.condition_name}
                  onChange={(e) => setNewCondition(prev => ({
                    ...prev,
                    condition_name: e.target.value
                  }))}
                  placeholder="e.g., Arthritis, Diabetes"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newCondition.condition_type}
                  onChange={(e) => setNewCondition(prev => ({
                    ...prev,
                    condition_type: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="chronic">Chronic</option>
                  <option value="acute">Acute</option>
                  <option value="genetic">Genetic</option>
                  <option value="behavioral">Behavioral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={newCondition.severity}
                  onChange={(e) => setNewCondition(prev => ({
                    ...prev,
                    severity: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosed Date
                </label>
                <input
                  type="date"
                  value={newCondition.diagnosed_date}
                  onChange={(e) => setNewCondition(prev => ({
                    ...prev,
                    diagnosed_date: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosed By
              </label>
              <input
                type="text"
                value={newCondition.diagnosed_by}
                onChange={(e) => setNewCondition(prev => ({
                  ...prev,
                  diagnosed_by: e.target.value
                }))}
                placeholder="Dr. Smith, Pet Care Clinic"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Plan
              </label>
              <textarea
                value={newCondition.treatment_plan}
                onChange={(e) => setNewCondition(prev => ({
                  ...prev,
                  treatment_plan: e.target.value
                }))}
                placeholder="Describe the treatment plan..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addMedicalCondition}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Save Condition
              </button>
              <button
                onClick={() => setShowAddCondition(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      {/* Current Medications */}
      <div className="space-y-3">
        {medicalData.current_medications.length > 0 ? (
          medicalData.current_medications.map((medication, index) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">
                    {medication.medication_name || medication}
                  </h4>
                  {medication.dosage && (
                    <p className="text-sm text-green-700">
                      Dosage: {medication.dosage} {medication.frequency && `- ${medication.frequency}`}
                    </p>
                  )}
                  {medication.indication && (
                    <p className="text-sm text-green-600 mt-1">
                      For: {medication.indication}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No current medications recorded</p>
        )}
      </div>

      {/* Add New Medication */}
      <div className="border-t pt-4">
        {!showAddMedication ? (
          <button
            onClick={() => setShowAddMedication(true)}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            + Add Current Medication
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold">Add New Medication</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={newMedication.medication_name}
                  onChange={(e) => setNewMedication(prev => ({
                    ...prev,
                    medication_name: e.target.value
                  }))}
                  placeholder="e.g., Rimadyl, Prednisone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({
                    ...prev,
                    dosage: e.target.value
                  }))}
                  placeholder="e.g., 25mg, 1 tablet"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({
                    ...prev,
                    frequency: e.target.value
                  }))}
                  placeholder="e.g., Twice daily, Every 8 hours"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  value={newMedication.route}
                  onChange={(e) => setNewMedication(prev => ({
                    ...prev,
                    route: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="oral">Oral</option>
                  <option value="topical">Topical</option>
                  <option value="injection">Injection</option>
                  <option value="inhalation">Inhalation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newMedication.start_date}
                  onChange={(e) => setNewMedication(prev => ({
                    ...prev,
                    start_date: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescribed By
                </label>
                <input
                  type="text"
                  value={newMedication.prescribed_by}
                  onChange={(e) => setNewMedication(prev => ({
                    ...prev,
                    prescribed_by: e.target.value
                  }))}
                  placeholder="Dr. Smith"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is this for?
              </label>
              <input
                type="text"
                value={newMedication.indication}
                onChange={(e) => setNewMedication(prev => ({
                  ...prev,
                  indication: e.target.value
                }))}
                placeholder="e.g., Pain relief, Infection"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={newMedication.special_instructions}
                onChange={(e) => setNewMedication(prev => ({
                  ...prev,
                  special_instructions: e.target.value
                }))}
                placeholder="Give with food, avoid dairy, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addCurrentMedication}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Save Medication
              </button>
              <button
                onClick={() => setShowAddMedication(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAlertsAndDiet = () => (
    <div className="space-y-6">
      {/* Medical Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🚨 Medical Alerts</h3>
        <div className="space-y-2">
          {medicalData.medical_alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-800">{alert}</span>
              <button
                onClick={() => removeMedicalAlert(index)}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex space-x-2">
          <input
            type="text"
            value={newAlert}
            onChange={(e) => setNewAlert(e.target.value)}
            placeholder="Add medical alert (e.g., 'Allergic to penicillin')"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            onKeyPress={(e) => e.key === 'Enter' && addMedicalAlert()}
          />
          <button
            onClick={addMedicalAlert}
            disabled={!newAlert.trim()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🥗 Dietary Restrictions</h3>
        <div className="space-y-2">
          {medicalData.dietary_restrictions.map((restriction, index) => (
            <div key={index} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <span className="text-orange-800">{restriction}</span>
              <button
                onClick={() => removeDietaryRestriction(index)}
                className="text-orange-600 hover:text-orange-800 ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex space-x-2">
          <input
            type="text"
            value={newDietaryRestriction}
            onChange={(e) => setNewDietaryRestriction(e.target.value)}
            placeholder="Add dietary restriction (e.g., 'No chicken', 'Grain-free only')"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            onKeyPress={(e) => e.key === 'Enter' && addDietaryRestriction()}
          />
          <button
            onClick={addDietaryRestriction}
            disabled={!newDietaryRestriction.trim()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Allergies (from pet profile) */}
      {pet?.allergies && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">⚠️ Known Allergies</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800">{pet.allergies}</p>
            <p className="text-sm text-yellow-600 mt-1">
              Update this in your pet's main profile if needed
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">📅 Medical Timeline</h3>
        <button
          onClick={loadTimeline}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      
      {timeline.length > 0 ? (
        <div className="space-y-3">
          {timeline.map((event, index) => (
            <div key={index} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      event.severity === 'emergency' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      event.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.severity}
                    </span>
                    <span>📍 {event.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No medical events recorded yet</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">🏥 Medical History Manager</h2>
              <p className="text-blue-100 mt-1">
                Managing medical history for {pet?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'conditions' && renderConditions()}
          {activeTab === 'medications' && renderMedications()}
          {activeTab === 'alerts' && renderAlertsAndDiet()}
          {activeTab === 'timeline' && renderTimeline()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 This medical history will be automatically used in Luni Triage assessments
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={saveMedicalHistory}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>💾 Save Medical History</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryManager;