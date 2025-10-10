import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import * as Sentry from '@sentry/react';

// Role-based access control
import { ensurePetOwnerAccess, USER_ROLES } from '../utils/roleUtils';

// Modular Dashboard Components
import PetOwnerLayout from './dashboard/PetOwnerLayout';
import PetOwnerTabs from './dashboard/PetOwnerTabs';
import PetOwnerStats from './dashboard/PetOwnerStats';
import PetOwnerBanners from './dashboard/PetOwnerBanners';
import PetOwnerFloatingActions from './dashboard/PetOwnerFloatingActions';

// Existing Components (reused)
import ProfileHeader from './ProfileHeader';
import PetsGallery from './PetsGallery';
import HealthAlerts from './HealthAlerts';
import UsageStatus from './UsageStatus';
import BookingsQuickActions from './BookingsQuickActions';
import HealthRecordsViewer from './HealthRecordsViewer';
import CaseHistoryViewer from './CaseHistoryViewer';
import FavoriteButton from './FavoriteButton';

// Form Components
import AddHealthRecordForm from './AddHealthRecordForm';
import EditHealthRecordForm from './EditHealthRecordForm';
import AddPetForm from './AddPetForm';

// Services
import favoritesService from '../services/favoritesService';
import petService from '../services/petService';
import healthRecordService from '../services/healthRecordService';

// Constants and Utils
import { STORAGE_BUCKETS } from '../lib/constants';
import { PetIcon, HealthIcon, UIIcon } from './MinimalIcons';
import { createRealtimeSubscription } from '../lib/supabase-utils.js';

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  
  // Core State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Pet and Health Data
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [healthRecordsData, setHealthRecordsData] = useState({});
  const [petHealthStats, setPetHealthStats] = useState({});
  
  // User Plan and Usage
  const [userPlan, setUserPlan] = useState('free');
  const [aiTriageCount, setAiTriageCount] = useState(0);
  const [weeklyCaseCount, setWeeklyCaseCount] = useState(0);
  const [lastCaseDate, setLastCaseDate] = useState(null);
  const [extraCasesPurchased, setExtraCasesPurchased] = useState(0);
  const [totalSpentOnExtras, setTotalSpentOnExtras] = useState(0);
  
  // UI State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showExtraCaseModal, setShowExtraCaseModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Form States
  const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
  const [showEditHealthRecordForm, setShowEditHealthRecordForm] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [showPetSelectionModal, setShowPetSelectionModal] = useState(false);
  const [selectedPetForHealth, setSelectedPetForHealth] = useState(null);
  const [selectedHealthRecordForEdit, setSelectedHealthRecordForEdit] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [recordsRefreshKey, setRecordsRefreshKey] = useState(0);
  
  // Favorites State
  const [dashboardFavorites, setDashboardFavorites] = useState([]);
  const [filteredDashboardFavorites, setFilteredDashboardFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesFilterType, setFavoritesFilterType] = useState('all');
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');

  // Load user data and initialize dashboard
  const loadUserData = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate('/signin');
        return;
      }
      setUser(user);

      // Load or create profile with proper role validation
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let currentProfile = profileData;

      if (profileError && profileError.code === 'PGRST116') {
        // Create profile if it doesn't exist - ensure pet_owner role
        const correctRole = ensurePetOwnerAccess.getRoleForEmail(user.email);
        
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            role: correctRole,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            is_active: true,
          }])
          .select()
          .single();
        
        if (newProfile) {
          currentProfile = newProfile;
        }
      } else if (!profileError) {
        // Validate existing profile access
        const accessValidation = ensurePetOwnerAccess.validateDashboardAccess(profileData);
        
        if (!accessValidation.hasAccess) {
          console.warn('User does not have dashboard access:', accessValidation.message);
          // Optionally redirect to appropriate dashboard or show access denied
        }

        // Special handling for Anna Wilson to ensure she has pet_owner role
        if (user.email === 'anna-wilson@gmail.com' && profileData.role !== USER_ROLES.PET_OWNER) {
          console.log('Updating Anna Wilson to pet_owner role');
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ 
              role: USER_ROLES.PET_OWNER,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();
          
          if (updatedProfile) {
            currentProfile = updatedProfile;
          }
        }
      }

      setProfile(currentProfile);

      // Set usage data
      setUserPlan(currentProfile?.subscription_plan || 'free');
      setAiTriageCount(currentProfile?.ai_triage_count || 0);
      setWeeklyCaseCount(currentProfile?.weekly_case_count || 0);
      setLastCaseDate(currentProfile?.last_case_date);
      setExtraCasesPurchased(currentProfile?.extra_cases_purchased || 0);
      setTotalSpentOnExtras(currentProfile?.total_spent_on_extras || 0);

      // Load bookings
      const { data: bookingsData } = await supabase
        .from('consultation_bookings')
        .select('*, provider_listings(title, provider_name, service_type)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setBookings(bookingsData || []);

      // Load pets and health data
      await loadPetsData(user.id);

    } catch (error) {
      Sentry.captureException(error);
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Load pets and associated health data
  const loadPetsData = async (userId) => {
    try {
      const petsResult = await petService.getUserPets(userId);
      if (petsResult.success) {
        setPets(petsResult.data);
        
        // Load health data for all pets
        const alerts = [];
        const healthRecords = {};
        const healthStats = {};

        const healthPromises = petsResult.data.map(async (pet) => {
          const [recordsResult, statsResult] = await Promise.all([
            healthRecordService.getHealthRecords(pet.id),
            healthRecordService.getHealthStats(pet.id)
          ]);

          healthRecords[pet.id] = recordsResult.success ? (recordsResult.data || []) : [];
          
          if (statsResult.success) {
            healthStats[pet.id] = statsResult.data;
            
            // Generate alerts
            if (statsResult.data.overdueVaccinations > 0) {
              alerts.push({
                petId: pet.id,
                petName: pet.name,
                type: 'vaccination',
                message: `${statsResult.data.overdueVaccinations} overdue vaccination${statsResult.data.overdueVaccinations > 1 ? 's' : ''}`,
                urgent: true
              });
            }
          }
        });

        await Promise.all(healthPromises);
        
        setHealthAlerts(alerts);
        setHealthRecordsData(healthRecords);
        setPetHealthStats(healthStats);
      }
    } catch (error) {
      console.error('Error loading pets data:', error);
    }
  };

  // Utility functions for usage limits
  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const canAddMorePets = () => userPlan === 'premium' || pets.length < 3;
  const canUseAiTriage = () => userPlan === 'premium' || aiTriageCount < 3;
  
  const canCreateCaseThisWeek = () => {
    if (userPlan === 'premium') return true;
    const currentWeekStart = getWeekStart().toDateString();
    const lastCaseWeekStart = lastCaseDate ? getWeekStart(new Date(lastCaseDate)).toDateString() : null;
    return lastCaseWeekStart !== currentWeekStart || weeklyCaseCount < 1;
  };

  const getRemainingFreeCasesThisWeek = () => {
    if (userPlan === 'premium') return 'Unlimited';
    const currentWeekStart = getWeekStart().toDateString();
    const lastCaseWeekStart = lastCaseDate ? getWeekStart(new Date(lastCaseDate)).toDateString() : null;
    return lastCaseWeekStart !== currentWeekStart ? 1 : Math.max(0, 1 - weeklyCaseCount);
  };

  // Health statistics calculation
  const getHealthStats = () => {
    const totalPets = pets.length;
    const totalHealthRecords = Object.values(healthRecordsData).reduce((sum, records) => sum + records.length, 0);
    const healthyPets = pets.length - healthAlerts.filter(alert => alert.urgent).length;
    const overdueVaccinations = healthAlerts.filter(alert => alert.type === 'vaccination').length;
    
    const petsUpToDate = pets.filter(pet => {
      const petRecords = healthRecordsData[pet.id] || [];
      const vaccinationRecords = petRecords.filter(record => record.record_type === 'vaccination');
      if (vaccinationRecords.length === 0) return false;
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      return vaccinationRecords.some(record => 
        new Date(record.date_performed) > oneYearAgo
      );
    }).length;
    
    return {
      totalPets,
      totalHealthRecords,
      healthyPets,
      petsUpToDate,
      overdueVaccinations,
      healthPercentage: totalPets > 0 ? Math.round((healthyPets / totalPets) * 100) : 100
    };
  };

  // Event handlers
  const handleAddPet = () => {
    if (!canAddMorePets()) {
      alert('You have reached the 3-pet limit on your current plan. Please upgrade to add more pets.');
      return;
    }
    setEditingPet(null);
    setShowAddPetForm(true);
  };

  const handlePetFormSuccess = (newPet) => {
    if (editingPet) {
      setPets(prevPets => prevPets.map(pet => pet.id === editingPet.id ? newPet : pet));
    } else {
      setPets(prevPets => [newPet, ...prevPets]);
    }
    setShowAddPetForm(false);
    setEditingPet(null);
  };

  const handleAddHealthRecord = (pet) => {
    setSelectedPetForHealth(pet);
    setShowHealthRecordForm(true);
  };

  const handleHealthRecordSuccess = async () => {
    await loadPetsData(user.id);
    setShowHealthRecordForm(false);
    setSelectedPetForHealth(null);
    setRecordsRefreshKey(prev => prev + 1);
  };

  // Effects
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (user && activeTab === 'favorites') {
      loadFavorites();
    }
  }, [user, activeTab]);

  // Realtime subscription
  useEffect(() => {
    let channel;
    const setupRealtime = async () => {
      if (!user) return;
      channel = createRealtimeSubscription('profiles', (payload) => {
        if (!payload?.new) return;
        const updated = payload.new;
        if (typeof updated.ai_triage_count !== 'undefined') {
          setAiTriageCount(updated.ai_triage_count || 0);
        }
        if (typeof updated.weekly_case_count !== 'undefined') {
          setWeeklyCaseCount(updated.weekly_case_count || 0);
        }
        if (typeof updated.last_case_date !== 'undefined') {
          setLastCaseDate(updated.last_case_date || null);
        }
      }, { filter: `id=eq.${user.id}` });
    };
    setupRealtime();
    return () => {
      if (channel) {
        channel.cleanup ? channel.cleanup() : supabase.removeChannel(channel);
      }
    };
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      setFavoritesLoading(true);
      const result = await favoritesService.getUserFavoritesWithDetails(user.id);
      if (result.success) {
        setDashboardFavorites(result.data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Debug logging for Anna Wilson
  useEffect(() => {
    if (user && user.email === 'anna-wilson@gmail.com') {
      console.log('🎯 Anna Wilson Dashboard Access:', {
        email: user.email,
        role: profile?.role,
        hasAccess: profile?.role === USER_ROLES.PET_OWNER,
        dashboardRoute: '/pet-owner-dashboard'
      });
    }
  }, [user, profile]);
  
  return (
    <PetOwnerLayout loading={loading}>
      {/* Banners */}
      <PetOwnerBanners
        userPlan={userPlan}
        aiTriageCount={aiTriageCount}
        totalSpentOnExtras={totalSpentOnExtras}
        canCreateCaseThisWeek={canCreateCaseThisWeek()}
        onShowExtraCaseModal={() => setShowExtraCaseModal(true)}
      />

      {/* Health Alerts */}
      <HealthAlerts healthAlerts={healthAlerts} />

      {/* Navigation Tabs */}
      <PetOwnerTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <ProfileHeader
            profile={profile}
            user={user}
            profilePhotoUrl={profile?.avatar_url}
            pets={pets}
            healthStats={getHealthStats()}
            bookings={bookings}
            onPhotoUpload={async (e) => {
              // Handle photo upload logic here
            }}
          />

          <PetsGallery
            pets={pets}
            userPlan={userPlan}
            dismissedPetLimitBanner={false}
            onAddPet={handleAddPet}
            onEditPet={(pet) => {
              setEditingPet(pet);
              setShowAddPetForm(true);
            }}
            onDeletePet={async (petId) => {
              const confirmed = window.confirm('Delete this pet? This removes all data and files. This cannot be undone.');
              if (confirmed) {
                const result = await petService.deletePetCascade(petId);
                if (result.success) {
                  setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
                }
              }
            }}
            onDismissPetLimitBanner={() => {}}
            FreemiumLimitBanner={() => null}
          />

          <BookingsQuickActions 
            bookings={bookings} 
            onSetActiveTab={setActiveTab}
          />

          <UsageStatus
            userPlan={userPlan}
            totalSpentOnExtras={totalSpentOnExtras}
            pets={pets}
            onShowExtraCaseModal={() => setShowExtraCaseModal(true)}
            getRemainingFreeCasesThisWeek={getRemainingFreeCasesThisWeek}
            canCreateCaseThisWeek={canCreateCaseThisWeek}
            canUseAiTriage={canUseAiTriage}
            canAddMorePets={canAddMorePets}
          />
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-4 sm:space-y-6">
          {pets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#E5F4F1] rounded-full flex items-center justify-center">
                <HealthIcon type="health" className="w-10 h-10" color="#5EB47C" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Pet's Health Journey</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Add your pets first to start tracking their health records, vaccinations, medications, and more.
              </p>
              <button
                onClick={() => setActiveTab('overview')}
                className="inline-flex items-center px-6 py-3 bg-[#5EB47C] text-white rounded-xl hover:bg-[#4A9A64] transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Pet
              </button>
            </div>
          ) : (
            <>
              <PetOwnerStats 
                totalPets={pets.length}
                totalHealthRecords={getHealthStats().totalHealthRecords}
                petsUpToDate={getHealthStats().petsUpToDate}
                healthPercentage={getHealthStats().healthPercentage}
                healthAlerts={healthAlerts.length}
                onHealthRecordsClick={() => {
                  document.getElementById('health-records-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onAlertsClick={() => {
                  // Scroll to alerts or handle alert click
                }}
              />

              <HealthRecordsViewer 
                pets={pets} 
                userPlan={userPlan}
                onEditRecord={(record) => {
                  setSelectedHealthRecordForEdit(record);
                  setShowEditHealthRecordForm(true);
                }}
                onAddRecord={handleAddHealthRecord}
                onRefresh={() => loadPetsData(user.id)}
                refreshKey={recordsRefreshKey}
              />
            </>
          )}
        </div>
      )}

      {activeTab === 'cases' && (
        <div className="space-y-4 sm:space-y-6">
          <CaseHistoryViewer pets={pets} userId={user?.id} />
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Favorites content would go here */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Favorites</h3>
            <p className="text-gray-600">Your favorite services and products will appear here.</p>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <PetOwnerFloatingActions
        canUseAiTriage={canUseAiTriage}
        canCreateCaseThisWeek={canCreateCaseThisWeek}
        userPlan={userPlan}
        getRemainingFreeCasesThisWeek={getRemainingFreeCasesThisWeek}
        onShowExtraCaseModal={() => setShowExtraCaseModal(true)}
        showMobileMenu={showMobileMenu}
        onToggleMobileMenu={setShowMobileMenu}
      />

      {/* Modals */}
      {showHealthRecordForm && selectedPetForHealth && (
        <AddHealthRecordForm
          petId={selectedPetForHealth.id}
          petName={selectedPetForHealth.name}
          onClose={() => {
            setShowHealthRecordForm(false);
            setSelectedPetForHealth(null);
          }}
          onSuccess={handleHealthRecordSuccess}
        />
      )}

      {showEditHealthRecordForm && selectedHealthRecordForEdit && (
        <EditHealthRecordForm
          record={selectedHealthRecordForEdit}
          onClose={() => {
            setShowEditHealthRecordForm(false);
            setSelectedHealthRecordForEdit(null);
          }}
          onSuccess={() => {
            loadPetsData(user.id);
            setShowEditHealthRecordForm(false);
            setSelectedHealthRecordForEdit(null);
          }}
        />
      )}

      {showAddPetForm && user && (
        <AddPetForm
          onClose={() => {
            setShowAddPetForm(false);
            setEditingPet(null);
          }}
          onSuccess={handlePetFormSuccess}
          userId={user.id}
          editingPet={editingPet}
        />
      )}
    </PetOwnerLayout>
  );
};

export default PetOwnerDashboard;