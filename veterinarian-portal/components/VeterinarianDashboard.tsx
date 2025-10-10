import React, { useEffect, useState } from 'react';
import { VeterinarianProvider, useVeterinarian } from '../contexts/VeterinarianContext';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorBoundary } from './common/ErrorBoundary';
import { usePatients } from '../hooks/usePatients';
import { DASHBOARD_SECTIONS, PROVIDER_TYPES, ANIMAL_SPECIES, SUCCESS_MESSAGES } from '../constants';
import { dateUtils, stringUtils, searchUtils, mobileUtils } from '../utils';
import type { Patient, PatientFormData } from '../types';

// Simple Auth Hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ provider_type: PROVIDER_TYPES.VETERINARIAN });
  const [loading, setLoading] = useState(false);
  
  return { user: { id: '1' }, profile, loading };
};

// Simplified Dashboard Content
const VeterinarianDashboardContent: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { state, setActiveSection, setPatients, addPatient, updatePatient, removePatient, setStats } = useVeterinarian();
  const { patients: patientsData, loading: patientsLoading, createPatient, editPatient, deletePatient } = usePatients();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Load patients and stats
  useEffect(() => {
    if (patientsData) {
      setPatients(patientsData);
      setStats({
        totalPatients: patientsData.length,
        totalBookings: 0,
        totalProcedures: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
        activeServices: 0,
        completedCases: 0,
        pendingCases: 0
      });
    }
  }, [patientsData, setPatients, setStats]);

  if (authLoading || patientsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Filter patients based on search
  const filteredPatients = searchUtils.filterPatients(state.patients, searchTerm);

  // Enhanced navigation handler with mobile scroll-to-top
  const handleNavigation = (section: string) => {
    setActiveSection(section);
    mobileUtils.scrollToTopOnNavigate();
  };

  // Enhanced modal handlers with mobile scroll-to-top
  const handleShowAddModal = () => {
    setShowAddModal(true);
    mobileUtils.scrollToTop();
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    mobileUtils.scrollToTop();
  };

  // Handle patient operations with mobile scroll-to-top
  const handleCreatePatient = async (patientData: PatientFormData) => {
    const result = await createPatient(patientData);
    if (result.success && result.data) {
      addPatient(result.data);
      setShowAddModal(false);
      mobileUtils.scrollToTop();
    }
    return result;
  };

  const handleUpdatePatient = async (patientData: PatientFormData) => {
    if (!editingPatient) return { success: false, error: 'No patient selected' };
    
    const result = await editPatient(editingPatient.id, patientData);
    if (result.success && result.data) {
      updatePatient(result.data);
      setEditingPatient(null);
      mobileUtils.scrollToTop();
    }
    return result;
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      const result = await deletePatient(patient.id, patient.name);
      if (result.success) {
        removePatient(patient.id);
        mobileUtils.scrollToTop();
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPatient(null);
    mobileUtils.scrollToTop();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Veterinarian Dashboard</h1>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Mobile Navigation Bar */}
        <nav className="md:hidden bg-white shadow-lg border-b">
          <div className="p-4">
            {/* Mobile Header */}
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-900">Vet Dashboard</h2>
            </div>
            
            {/* Mobile Navigation Tabs */}
            <div className="flex space-x-2 overflow-x-auto">
              {Object.entries(DASHBOARD_SECTIONS).map(([key, section]) => (
                <button
                  key={section}
                  onClick={() => handleNavigation(section)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    state.activeSection === section
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {stringUtils.capitalize(section)}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Desktop Sidebar Navigation */}
        <nav className="hidden md:block w-64 bg-white shadow-lg h-screen sticky top-0">
          <div className="p-4">
            {/* Sidebar Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Vet Dashboard</h2>
              <p className="text-sm text-gray-500">Veterinarian</p>
            </div>
            
            {/* Navigation Items */}
            <div className="space-y-2">
              {Object.entries(DASHBOARD_SECTIONS).map(([key, section]) => (
                <button
                  key={section}
                  onClick={() => handleNavigation(section)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    state.activeSection === section
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {stringUtils.capitalize(section)}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {state.activeSection === DASHBOARD_SECTIONS.OVERVIEW && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
                  <p className="text-2xl font-bold text-gray-900">{state.stats.totalPatients}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                  <p className="text-2xl font-bold text-gray-900">{state.stats.totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Completed Cases</h3>
                  <p className="text-2xl font-bold text-gray-900">{state.stats.completedCases}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Pending Cases</h3>
                  <p className="text-2xl font-bold text-gray-900">{state.stats.pendingCases}</p>
                </div>
              </div>
            </div>
          )}

          {state.activeSection === DASHBOARD_SECTIONS.PATIENTS && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Patients</h2>
                <button
                  onClick={handleShowAddModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Patient
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Patients List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.species} {patient.breed && `(${patient.breed})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.owner_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dateUtils.formatDate(patient.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPatients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No patients found matching your search.' : 'No patients yet. Add your first patient!'}
                  </div>
                )}
              </div>
            </div>
          )}

          {state.activeSection === DASHBOARD_SECTIONS.PROFILE && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Profile</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{profile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider Type</label>
                    <p className="mt-1 text-sm text-gray-900">{stringUtils.capitalize(profile?.provider_type || '')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <PatientModal
          onClose={handleCloseModal}
          onSubmit={handleCreatePatient}
        />
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <PatientModal
          patient={editingPatient}
          onClose={handleCloseModal}
          onSubmit={handleUpdatePatient}
        />
      )}
    </div>
  );
};

// Simple Patient Modal Component
const PatientModal: React.FC<{
  patient?: Patient;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<any>;
}> = ({ patient, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: patient?.name || '',
    species: patient?.species || '',
    breed: patient?.breed || '',
    age: patient?.age || undefined,
    weight: patient?.weight || undefined,
    owner_name: patient?.owner_name || '',
    owner_phone: patient?.owner_phone || '',
    owner_email: patient?.owner_email || '',
    medical_history: patient?.medical_history || ''
  });
  const [loading, setLoading] = useState(false);

  // Scroll to top when modal opens on mobile
  useEffect(() => {
    mobileUtils.scrollToTop();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.species || !formData.owner_name) return;

    setLoading(true);
    const result = await onSubmit(formData);
    setLoading(false);
    
    if (result.success) {
      onClose();
    }
  };

  const handleModalClose = () => {
    onClose();
    mobileUtils.scrollToTop();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {patient ? 'Edit Patient' : 'Add New Patient'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pet Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Species *</label>
            <select
              required
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select species</option>
              {Object.values(ANIMAL_SPECIES).map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Breed</label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Owner Name *</label>
            <input
              type="text"
              required
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
            <input
              type="tel"
              value={formData.owner_phone}
              onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (patient ? 'Update' : 'Add')} Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Dashboard Component
const VeterinarianDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <ErrorBoundary>
        <VeterinarianProvider>
          <VeterinarianDashboardContent />
        </VeterinarianProvider>
      </ErrorBoundary>
    </div>
  );
};

export default VeterinarianDashboard;