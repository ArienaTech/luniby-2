import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import favoritesService from '../services/favoritesService';
import petService from '../services/petService';
import healthRecordService from '../services/healthRecordService';
import AddHealthRecordForm from './AddHealthRecordForm';
import EditHealthRecordForm from './EditHealthRecordForm';
import AddPetForm from './AddPetForm';
import HealthRecordsViewer from './HealthRecordsViewer';
import CaseHistoryViewer from './CaseHistoryViewer';
import FavoriteButton from './FavoriteButton';
import { STORAGE_BUCKETS } from '../lib/constants';
import { PetIcon, HealthIcon, UIIcon } from './MinimalIcons';
import * as Sentry from '@sentry/react';
import { createRealtimeSubscription } from '../lib/supabase-utils.js';

// Import new components
import ProfileHeader from './ProfileHeader';
import PetsGallery from './PetsGallery';
import HealthAlerts from './HealthAlerts';
import UsageStatus from './UsageStatus';
import BookingsQuickActions from './BookingsQuickActions';
// Banner components are defined inline below

const PetOwnerDashboardSimple = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [healthRecordsData, setHealthRecordsData] = useState({});
  const [petHealthStats, setPetHealthStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showHealthScoreHelp, setShowHealthScoreHelp] = useState(false);
  const [selectedPetForHealthHelp, setSelectedPetForHealthHelp] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
  const [showEditHealthRecordForm, setShowEditHealthRecordForm] = useState(false);
  const [selectedPetForHealth, setSelectedPetForHealth] = useState(null);
  const [selectedHealthRecordForEdit, setSelectedHealthRecordForEdit] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery] = useState('');
  const [filterType] = useState('all');
  const [userPlan, setUserPlan] = useState('free');
  const [aiTriageCount, setAiTriageCount] = useState(0);
  const [weeklyCaseCount, setWeeklyCaseCount] = useState(0);
  const [lastCaseDate, setLastCaseDate] = useState(null);
  const [extraCasesPurchased, setExtraCasesPurchased] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [totalSpentOnExtras, setTotalSpentOnExtras] = useState(0);
  const [showExtraCaseModal, setShowExtraCaseModal] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [dismissedPetLimitBanner, setDismissedPetLimitBanner] = useState(false);
  const [recordsRefreshKey, setRecordsRefreshKey] = useState(0);
  const [showPetSelectionModal, setShowPetSelectionModal] = useState(false);

  // Favorites state
  const [dashboardFavorites, setDashboardFavorites] = useState([]);
  const [filteredDashboardFavorites, setFilteredDashboardFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesFilterType, setFavoritesFilterType] = useState('all');
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');

  useEffect(() => {
    loadUserData();
    
    // Failsafe timeout in case loading gets stuck
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (user && activeTab === 'favorites') {
      loadDashboardFavorites();
    }
  }, [user, activeTab]);

  useEffect(() => {
    filterDashboardFavorites();
  }, [dashboardFavorites, favoritesFilterType, favoritesSearchTerm]);

  // Handle Escape key for pet selection modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showPetSelectionModal) {
        setShowPetSelectionModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPetSelectionModal]);

  useEffect(() => {
    let channel;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Subscribe to profile changes for the current user
      channel = createRealtimeSubscription('profiles', (payload) => {
        if (!payload?.new) return;
        const updated = payload.new;
        // Update AI triage counters when profile changes
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
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate('/signin');
        setLoading(false);
        return;
      }
      setUser(user);

      // Role gate and profile fetch
      const { data: profileDataFetched, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      let profileData = profileDataFetched;

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              role: 'pet_owner',
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (!createError) {
          profileData = newProfile;
        }
      } else if (profileError) {
        navigate('/signin');
        return;
      }

      // Allow all users to access dashboard regardless of role
      console.log('Dashboard Debug - User profile:', profileData);
      setProfile(profileData);
      
      // Set user plan and usage limits
      setUserPlan(profileData?.subscription_plan || 'free');
      setAiTriageCount(profileData?.ai_triage_count || 0);
      setWeeklyCaseCount(profileData?.weekly_case_count || 0);
      setLastCaseDate(profileData?.last_case_date);
      setExtraCasesPurchased(profileData?.extra_cases_purchased || 0);
      setTotalSpentOnExtras(profileData?.total_spent_on_extras || 0);

      // Load bookings
      const { data: bookingsData } = await supabase
        .from('consultation_bookings')
        .select(`
          *,
          provider_listings (
            title,
            provider_name,
            service_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setBookings(bookingsData || []);

      // Load favorites - handled by favorites tab

      // Notifications are now handled by the Navbar component

      // Load pets and health data
      try {
        const petsResult = await petService.getUserPets(user.id);
        if (petsResult.success) {
          setPets(petsResult.data);
          
          // Pet statistics are calculated from pet data

          // Get health alerts and records for all pets
          const alerts = [];
          const healthRecords = {};
          const healthStats = {};

          // Batch fetch records and stats for all pets in parallel
          const perPetPromises = petsResult.data.map(async (pet) => {
            const [recordsResult, healthStatsResult] = await Promise.all([
              healthRecordService.getHealthRecords(pet.id),
              healthRecordService.getHealthStats(pet.id)
            ]);

            healthRecords[pet.id] = recordsResult.success ? (recordsResult.data || []) : [];
            
            // Store health stats for each pet
            if (healthStatsResult.success) {
              healthStats[pet.id] = healthStatsResult.data;

              if (healthStatsResult.data.overdueVaccinations > 0) {
                alerts.push({
                  petId: pet.id,
                  petName: pet.name,
                  type: 'vaccination',
                  message: `${healthStatsResult.data.overdueVaccinations} overdue vaccination${healthStatsResult.data.overdueVaccinations > 1 ? 's' : ''}`,
                  urgent: true
                });
              }

              if (healthStatsResult.data.nextVaccinationDue) {
                const daysUntil = healthRecordService.getDaysUntilDue(healthStatsResult.data.nextVaccinationDue.next_due_date);
                if (daysUntil <= 30 && daysUntil > 0) {
                  alerts.push({
                    petId: pet.id,
                    petName: pet.name,
                    type: 'upcoming',
                    message: `Vaccination due in ${daysUntil} days`,
                    urgent: daysUntil <= 7
                  });
                }
              }
            }
          });

          await Promise.all(perPetPromises);

          setHealthAlerts(alerts);
          setHealthRecordsData(healthRecords);
          setPetHealthStats(healthStats);
        }
      } catch (petError) {
        // Pet service not available
      }

    } catch (error) {
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHealthRecord = (pet) => {
    setSelectedPetForHealth(pet);
    setShowHealthRecordForm(true);
  };

  const handleConsolidatedAddRecord = () => {
    if (pets.length === 1) {
      // If only one pet, directly open the form
      handleAddHealthRecord(pets[0]);
    } else {
      // If multiple pets, show selection modal
      setShowPetSelectionModal(true);
    }
  };

  const handlePetSelection = (pet) => {
    setShowPetSelectionModal(false);
    handleAddHealthRecord(pet);
  };

  const handleHealthRecordSuccess = async (newRecord) => {
    // Refresh health records for the specific pet
    if (newRecord && newRecord.pet_id) {
      const recordsResult = await healthRecordService.getHealthRecords(newRecord.pet_id);
      if (recordsResult.success) {
        setHealthRecordsData(prev => ({
          ...prev,
          [newRecord.pet_id]: recordsResult.data
        }));
      }
    }
    // Bump refresh key to force child viewer to reload from service
    setRecordsRefreshKey(prev => prev + 1);
    // Refresh health alerts and data
    loadUserData();
    setShowHealthRecordForm(false);
    setSelectedPetForHealth(null);
  };

  const handleEditHealthRecord = (record) => {
    setSelectedHealthRecordForEdit(record);
    setShowEditHealthRecordForm(true);
  };

  const handleHealthRecordUpdate = () => {
    // Refresh pets and health data after update
    loadUserData();
    setShowEditHealthRecordForm(false);
    setSelectedHealthRecordForEdit(null);
  };

  // Pet handlers
  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setShowAddPetForm(true);
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
      } else {
        alert('Failed to delete pet: ' + result.error);
      }
    } catch (error) {
      alert('Failed to delete pet. Please try again.');
    }
  };

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
      // Update existing pet
      setPets(prevPets => 
        prevPets.map(pet => pet.id === editingPet.id ? newPet : pet)
      );
    } else {
      // Add new pet
      setPets(prevPets => [newPet, ...prevPets]);
    }
    setShowAddPetForm(false);
    setEditingPet(null);
  };

  const handlePetFormClose = () => {
    setShowAddPetForm(false);
    setEditingPet(null);
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    try {
      setUploadingPhoto(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-photos/profile-${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.PET_OWNERS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.PET_OWNERS)
        .getPublicUrl(fileName);
      
      // Update profile with photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
     
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      alert('Profile photo updated successfully!');
      
        } catch (error) {
      alert(`Failed to upload photo: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
     setUploadingPhoto(false);
     e.target.value = ''; // Reset file input
    }
  };

  const loadDashboardFavorites = async () => {
    if (!user) return;
    
    try {
      setFavoritesLoading(true);
      const result = await favoritesService.getUserFavoritesWithDetails(user.id);
      
      if (result.success) {
        setDashboardFavorites(result.data);
      }
    } catch (error) {
      // Silent fail for favorites loading
    } finally {
      setFavoritesLoading(false);
    }
  };

  const filterDashboardFavorites = useCallback(() => {
    let filtered = [...dashboardFavorites];

    // Filter by type
    if (favoritesFilterType === 'services') {
      filtered = filtered.filter(fav => fav.listing_type === 'service');
    } else if (favoritesFilterType === 'products') {
      filtered = filtered.filter(fav => fav.listing_type === 'product');
    }

    // Filter by search term
    if (favoritesSearchTerm) {
      filtered = filtered.filter(fav =>
        fav.name?.toLowerCase().includes(favoritesSearchTerm.toLowerCase()) ||
        fav.description?.toLowerCase().includes(favoritesSearchTerm.toLowerCase()) ||
        fav.provider_name?.toLowerCase().includes(favoritesSearchTerm.toLowerCase()) ||
        fav.category?.toLowerCase().includes(favoritesSearchTerm.toLowerCase())
      );
    }

    setFilteredDashboardFavorites(filtered);
  }, [dashboardFavorites, favoritesFilterType, favoritesSearchTerm]);

  const handleDashboardFavoriteToggle = (isFavorited, listingId, listingType) => {
    if (!isFavorited) {
      // Remove from favorites list when unfavorited
      setDashboardFavorites(prev => prev.filter(fav => 
        !(fav.listing_id === listingId && fav.listing_type === listingType)
      ));
    }
  };

  const getDashboardCategoryIcon = (category, listingType) => {
          if (listingType === 'product') return <UIIcon type="shopping" className="w-5 h-5" color="currentColor" />;
    
    const iconComponents = {
      'Veterinary': <HealthIcon type="health" className="w-5 h-5" color="currentColor" />,
      'Pet Grooming': <UIIcon type="scissors" className="w-5 h-5" color="currentColor" />,
      'Pet Training': <UIIcon type="graduation" className="w-5 h-5" color="currentColor" />,
      'Pet Breeding': <PetIcon species="dog" className="w-5 h-5" color="currentColor" />,
      'Nutritionists': <UIIcon type="food" className="w-5 h-5" color="currentColor" />,
      'Holistic Care': <UIIcon type="leaf" className="w-5 h-5" color="currentColor" />,
      'Dog Walking': <UIIcon type="walking" className="w-5 h-5" color="currentColor" />,
      'Pet Sitting': <UIIcon type="home" className="w-5 h-5" color="currentColor" />,
    };
    
    return iconComponents[category] || <PetIcon species="pet" className="w-5 h-5" color="currentColor" />;
  };





  // Search and filter functionality
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         pet.species.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'dogs') return matchesSearch && pet.species === 'dog';
    if (filterType === 'cats') return matchesSearch && pet.species === 'cat';
    if (filterType === 'alerts') {
      const hasAlerts = healthAlerts.some(alert => alert.petId === pet.id);
      return matchesSearch && hasAlerts;
    }
    
    return matchesSearch;
  });

  // Get health statistics for charts
  const getHealthStats = () => {
    const totalPets = pets.length;
    const totalHealthRecords = Object.values(healthRecordsData).reduce((sum, records) => sum + records.length, 0);
    const healthyPets = pets.length - healthAlerts.filter(alert => alert.urgent).length;
    const overdueVaccinations = healthAlerts.filter(alert => alert.type === 'vaccination').length;
    const upcomingAppointments = healthAlerts.filter(alert => alert.type === 'upcoming').length;
    
    // Calculate pets up to date with vaccinations (pets with recent vaccination records)
    const petsUpToDate = pets.filter(pet => {
      const petRecords = healthRecordsData[pet.id] || [];
      const vaccinationRecords = petRecords.filter(record => record.record_type === 'vaccination');
      if (vaccinationRecords.length === 0) return false;
      
      // Check if there's a vaccination in the last year
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
      upcomingAppointments,
      healthPercentage: totalPets > 0 ? Math.round((healthyPets / totalPets) * 100) : 100
    };
  };

  // Check if user can add more pets (freemium limit)
  const canAddMorePets = () => {
    if (userPlan === 'premium') return true;
    return pets.length < 3; // Free tier limited to 3 pets
  };

  // Check if user can use AI triage
  const canUseAiTriage = () => {
    if (userPlan === 'premium') return true;
    return aiTriageCount < 3; // Free tier limited to 3 AI triage sessions per month
  };

  // Get start of current week (Monday)
  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  };

  // Check if user can create a new case this week
  const canCreateCaseThisWeek = () => {
    if (userPlan === 'premium') return true;
    
    const currentWeekStart = getWeekStart().toDateString();
    const lastCaseWeekStart = lastCaseDate ? getWeekStart(new Date(lastCaseDate)).toDateString() : null;
    
    // If no case this week or it's a new week, user can create 1 free case
    if (lastCaseWeekStart !== currentWeekStart) return true;
    
    // If already created a case this week, check count
    return weeklyCaseCount < 1;
  };

  // Get remaining free cases for this week
  const getRemainingFreeCasesThisWeek = () => {
    if (userPlan === 'premium') return 'Unlimited';
    
    const currentWeekStart = getWeekStart().toDateString();
    const lastCaseWeekStart = lastCaseDate ? getWeekStart(new Date(lastCaseDate)).toDateString() : null;
    
    if (lastCaseWeekStart !== currentWeekStart) return 1; // New week, reset count
    return Math.max(0, 1 - weeklyCaseCount);
  };

  // Check if user needs to buy extra case
  const needsExtraCase = () => {
    if (userPlan === 'premium') return false;
    return !canCreateCaseThisWeek();
  };

  // Freemium limit component
  const FreemiumLimitBanner = ({ feature, current, limit, upgradeText, onClose, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6 ${className}`}>
      <div className="px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-start sm:items-center flex-1">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#5EB47C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {feature} Limit Reached
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                You're using {current} of {limit} {feature.toLowerCase()} on your free plan. {upgradeText}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:ml-4">
            <Link
              to="/pricing"
              className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
            >
              Upgrade Now
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Extra Case Purchase Modal
  const ExtraCasePurchaseModal = ({ isOpen, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePurchaseExtraCase = async () => {
      setIsProcessing(true);
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user's extra case purchases
        const newTotal = totalSpentOnExtras + 2.99;
        const newCount = extraCasesPurchased + 1;
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            extra_cases_purchased: newCount,
            total_spent_on_extras: newTotal
          })
          .eq('id', user.id);

        if (error) throw error;

        setExtraCasesPurchased(newCount);
        setTotalSpentOnExtras(newTotal);
        
        // Allow user to create case immediately
        onClose();
        
        // Navigate to AI triage
        navigate('/luni-triage');
        
      } catch (error) {
        alert('Purchase failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#5EB47C] to-green-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Need another Luni Triage this week?</h3>
                <p className="text-gray-600">You've used your free Luni Triage for this week. Get instant access for just $2.99.</p>
          </div>

          <div className="space-y-4 mb-6">
            {/* Primary Option - Buy Extra Case */}
            <button
              onClick={handlePurchaseExtraCase}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-[#5EB47C] to-green-600 text-white p-4 rounded-lg hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold">Get 1 Extra Luni Triage - $2.99</div>
                  <div className="text-sm opacity-90">Available immediately</div>
                </div>
              )}
            </button>

            {/* Premium Upgrade Suggestion */}
            {totalSpentOnExtras >= 3 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-1">💡 Smart Tip</div>
                <div className="font-semibold text-gray-900 mb-1">You've spent ${totalSpentOnExtras.toFixed(2)} on extra Luni Triage</div>
                <div className="text-sm text-gray-600 mb-3">Premium is only $9.99/month for unlimited Luni Triage!</div>
                <Link
                  to="/upgrade"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors inline-block"
                >
                  Upgrade & Save Money
                </Link>
              </div>
            )}

            {/* Free Option */}
            <button
              onClick={onClose}
              className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
            >
                                Wait until next week (free)
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Secure payment • Cancel anytime • No subscription required
          </div>
        </div>
      </div>
    );
  };

  // Spending Awareness Banner
  const SpendingAwarenessBanner = () => {
    if (userPlan !== 'free' || totalSpentOnExtras < 6) return null;

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 flex items-center">
                <UIIcon type="money" className="w-4 h-4 mr-2" color="currentColor" />
                You've spent ${totalSpentOnExtras.toFixed(2)} on extra Luni Triage
              </h3>
              <p className="text-sm text-yellow-700">
                Premium is only $9.99/month for unlimited access - you'd save money!
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/upgrade"
              className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Upgrade CTA component
  const UpgradeCTA = ({ title, description, benefits, compact = false }) => {
    if (compact) {
      return (
        <div className="bg-gradient-to-r from-[#5EB47C] to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-xs opacity-90">{description}</p>
            </div>
            <Link
              to="/pricing"
              className="bg-white text-[#5EB47C] px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              Upgrade
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border-2 border-dashed border-[#5EB47C] rounded-xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#5EB47C] to-green-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {benefits && (
          <ul className="text-sm text-gray-700 mb-6 space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/pricing"
          className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-md hover:shadow-lg"
        >
          Upgrade to Premium
        </Link>
        <p className="text-xs text-gray-500 mt-2">30-day free trial • Cancel anytime</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">

      <section className="pt-4 sm:pt-8 pb-8 px-3 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
        {/* Freemium Limits Banners */}
        {userPlan === 'free' && aiTriageCount >= 3 && (
          <FreemiumLimitBanner
            feature="AI Triage"
            current={aiTriageCount}
            limit="3"
            upgradeText="Get unlimited AI health consultations with Premium."
          />
        )}
        
        {/* Spending Awareness Banner */}
        <SpendingAwarenessBanner 
          totalSpentOnExtras={totalSpentOnExtras} 
          userPlan={userPlan} 
        />
        
        {userPlan === 'free' && !canCreateCaseThisWeek() && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-start sm:items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-blue-800">
                    You've used your free Luni Triage for this week
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Get instant access to another Luni Triage consultation for just $2.99, or upgrade to Premium for unlimited access.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-shrink-0">
                <button
                  onClick={() => setShowExtraCaseModal(true)}
                  className="bg-gradient-to-r from-[#5EB47C] to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-[#4A9A64] hover:to-green-700 transition-all shadow-sm hover:shadow-md"
                >
                  Buy Extra Luni Triage - $2.99
                </button>
                <Link
                  to="/upgrade"
                  className="bg-white text-blue-600 border border-blue-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-all text-center"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        )}



        {/* Health Alerts */}
        <HealthAlerts healthAlerts={healthAlerts} />

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'overview'
                    ? 'text-[#5EB47C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('health')}
                className={`py-2 px-1 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'health'
                    ? 'text-[#5EB47C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Health Records
              </button>
              
              <button
                onClick={() => setActiveTab('cases')}
                className={`py-2 px-1 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'cases'
                    ? 'text-[#5EB47C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                SOAP Notes
              </button>
              
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-2 px-1 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'favorites'
                    ? 'text-[#5EB47C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Favorites
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Pet Parent Profile Header */}
            <ProfileHeader
              profile={profile}
              user={user}
              profilePhotoUrl={profile?.avatar_url}
              pets={pets}
              healthStats={getHealthStats()}
              bookings={bookings}
              onPhotoUpload={handleProfilePhotoUpload}
            />

            {/* My Pets Gallery */}
            <PetsGallery
              pets={pets}
              userPlan={userPlan}
              dismissedPetLimitBanner={dismissedPetLimitBanner}
              onAddPet={handleAddPet}
              onEditPet={handleEditPet}
              onDeletePet={handleDeletePet}
              onDismissPetLimitBanner={() => setDismissedPetLimitBanner(true)}
              FreemiumLimitBanner={FreemiumLimitBanner}
            />

            {/* Bookings & Quick Actions */}
            <BookingsQuickActions 
              bookings={bookings} 
              onSetActiveTab={setActiveTab} 
            />

            {/* Usage Status for Free Users */}
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
        {/* Health & Records Tab */}
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
                {/* Health Stats Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">Health Dashboard</h2>
                        <p className="text-gray-600 text-sm">Complete health management for your pets</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPetForHealthHelp(null);
                          setShowHealthScoreHelp(true);
                        }}
                        className="w-4 h-4 sm:w-8 sm:h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                        title="Learn about health scores"
                      >
                        <span className="text-xs sm:text-sm font-bold">?</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Health Stats Grid */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <HealthIcon type="records" className="w-6 h-6" color="#3B82F6" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                          {getHealthStats().totalHealthRecords}
                        </div>
                        <div className="text-xs text-blue-700 font-medium">Health Records</div>
                      </div>
                      
                      <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <HealthIcon type="vaccination" className="w-6 h-6" color="#10B981" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                          {getHealthStats().petsUpToDate}
                        </div>
                        <div className="text-xs text-green-700 font-medium">Up to Date</div>
                      </div>
                      
                      <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <HealthIcon type="health" className="w-6 h-6" color="#8B5CF6" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                          {Math.round(getHealthStats().healthPercentage)}%
                        </div>
                        <div className="text-xs text-purple-700 font-medium">Health Score</div>
                      </div>
                      
                      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <HealthIcon type="warning" className="w-6 h-6" color="#F59E0B" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                          {healthAlerts.length}
                        </div>
                        <div className="text-xs text-orange-700 font-medium">Health Alerts</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pet Health Cards */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-gray-900">Pet Health Status</h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#5EB47C]">
                          {pets.length} pet{pets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {pets.length > 0 && (
                        <button
                          onClick={handleConsolidatedAddRecord}
                          className="flex items-center space-x-2 px-4 py-2 bg-[#5EB47C] hover:bg-[#4A9A64] text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Record</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="flex overflow-x-auto scrollbar-hide gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 pb-2">
                      {pets.map((pet) => (
                        <div key={pet.id} className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 flex-shrink-0 w-72 sm:w-auto">
                          {/* Pet Avatar and Info */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-[#E5F4F1] rounded-full flex items-center justify-center flex-shrink-0">
                              {pet.photo_url ? (
                                <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <PetIcon species={pet.species} className="w-5 h-5" color="#6B7280" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{pet.name}</h4>
                              <p className="text-sm text-gray-500 capitalize truncate">{pet.breed || pet.species}</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              petHealthStats[pet.id] ? (
                                petHealthStats[pet.id].healthScore >= 80 ? 'bg-green-400' :
                                petHealthStats[pet.id].healthScore >= 60 ? 'bg-yellow-400' :
                                'bg-red-400'
                              ) : 'bg-gray-400'
                            }`}></div>
                          </div>
                          
                          {/* Health Score Badge */}
                          <div className="flex items-center justify-between mb-4">
                            {petHealthStats[pet.id] ? (
                              <div className="flex items-center space-x-2">
                                <span 
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-help ${
                                    petHealthStats[pet.id].healthScore >= 90 ? 'bg-green-100 text-green-800' :
                                    petHealthStats[pet.id].healthScore >= 80 ? 'bg-green-100 text-green-700' :
                                    petHealthStats[pet.id].healthScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    petHealthStats[pet.id].healthScore >= 60 ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                  title={`Health Status: ${petHealthStats[pet.id].healthStatus}\n\nFactors affecting score:\n${petHealthStats[pet.id].healthFactors?.map(f => `• ${f.category}: ${f.description} (${f.impact >= 0 ? '+' : ''}${f.impact} pts)`).join('\n')}\n\nClick the ? button to learn how to improve this score!`}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-1 ${
                                    petHealthStats[pet.id].healthScore >= 90 ? 'bg-green-600' :
                                    petHealthStats[pet.id].healthScore >= 80 ? 'bg-green-500' :
                                    petHealthStats[pet.id].healthScore >= 70 ? 'bg-yellow-500' :
                                    petHealthStats[pet.id].healthScore >= 60 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}></div>
                                  {petHealthStats[pet.id].healthScore}/100 ({petHealthStats[pet.id].healthGrade})
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPetForHealthHelp(pet);
                                    setShowHealthScoreHelp(true);
                                  }}
                                  className="w-2 h-2 sm:w-4 sm:h-4 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Learn about this pet's health score"
                                >
                                  <span className="text-[10px] sm:text-xs font-bold">?</span>
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <div className="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>
                                Loading...
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {(healthRecordsData[pet.id] || []).length} records
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Health Alerts */}
                {healthAlerts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <HealthIcon type="warning" className="w-5 h-5" color="#F59E0B" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Health Alerts</h3>
                          <p className="text-sm text-gray-600">Important reminders for your pets</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-3">
                        {healthAlerts.slice(0, 5).map((alert, index) => (
                          <div key={index} className={`p-4 rounded-xl border-l-4 ${
                            alert.urgent 
                              ? 'bg-red-50 border-red-400' 
                              : 'bg-yellow-50 border-yellow-400'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <span className={`text-xl flex-shrink-0 ${
                                alert.urgent ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {alert.type === 'vaccination' ? 
                                  <HealthIcon type="vaccination" className="w-4 h-4" color="currentColor" /> : 
                                  <HealthIcon type="calendar" className="w-4 h-4" color="currentColor" />
                                }
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-900">{alert.petName}</h4>
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    alert.urgent 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {alert.urgent ? 'Urgent' : 'Reminder'}
                                  </span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                  alert.urgent ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                  {alert.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Health Records History */}
            {pets.length > 0 && (
              <div id="health-records-section" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Health Records</h3>
                        <p className="text-sm text-gray-600">Complete medical history for all your pets</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <HealthRecordsViewer 
                    pets={pets} 
                    userPlan={userPlan}
                    onEditRecord={handleEditHealthRecord}
                    onAddRecord={handleAddHealthRecord}
                    onRefresh={() => {
                      // Refresh health records data
                      pets.forEach(async (pet) => {
                        const recordsResult = await healthRecordService.getHealthRecords(pet.id);
                        if (recordsResult.success) {
                          setHealthRecordsData(prev => ({
                            ...prev,
                            [pet.id]: recordsResult.data
                          }));
                        }
                      });
                      loadUserData();
                    }}
                    refreshKey={recordsRefreshKey}
                  />
                </div>
                
                {userPlan === 'free' && (
                  <div className="px-6 pb-6">
                    <div className="bg-gradient-to-r from-[#E5F4F1] to-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-[#5EB47C] rounded-lg flex items-center justify-center flex-shrink-0">
                          <UIIcon type="star" className="w-5 h-5" color="white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Unlock Advanced Health Analytics</h4>
                          <p className="text-sm text-gray-600 mb-3">Get detailed health trends, SOAP notes, and veterinary-grade insights</p>
                          <ul className="text-xs text-gray-600 space-y-1 mb-4">
                            <li className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              Professional SOAP notes
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              Health trend analysis
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              Veterinary-grade insights
                            </li>
                          </ul>
                          <Link
                            to="/pricing"
                            className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium"
                          >
                            Upgrade to Premium
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Case History & SOAP Notes Tab */}
        {activeTab === 'cases' && (
          <div className="space-y-4 sm:space-y-6">
            <CaseHistoryViewer pets={pets} userId={user?.id} />
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Favorites</h3>
                  <p className="text-sm text-gray-600">Services and products you've saved from the marketplace</p>
                </div>
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#E5F4F1] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#5EB47C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#5EB47C]">
                    {dashboardFavorites.length} item{dashboardFavorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-6">
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={favoritesSearchTerm}
                    onChange={(e) => setFavoritesSearchTerm(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setFavoritesFilterType('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      favoritesFilterType === 'all'
                        ? 'bg-[#5EB47C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFavoritesFilterType('services')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      favoritesFilterType === 'services'
                        ? 'bg-[#5EB47C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Services
                  </button>
                  <button
                    onClick={() => setFavoritesFilterType('products')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      favoritesFilterType === 'products'
                        ? 'bg-[#5EB47C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Products
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {favoritesLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
                </div>
              )}

              {/* Empty State */}
              {!favoritesLoading && filteredDashboardFavorites.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-500 mb-4">
                    {favoritesSearchTerm || favoritesFilterType !== 'all' 
                      ? 'No favorites match your current filters.' 
                      : 'Start exploring the marketplace and click the heart icon to save your favorites here!'
                    }
                  </p>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              )}

              {/* Favorites Grid */}
              {!favoritesLoading && filteredDashboardFavorites.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {filteredDashboardFavorites.map((favorite) => (
                    <div key={`${favorite.listing_type}-${favorite.listing_id}`} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getDashboardCategoryIcon(favorite.category, favorite.listing_type)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{favorite.name}</h3>
                            <p className="text-sm text-gray-500">{favorite.listing_type === 'product' ? 'Product' : 'Service'}</p>
                          </div>
                        </div>
                        <FavoriteButton
                          listingId={favorite.listing_id}
                          listingType={favorite.listing_type}
                          size="sm"
                          onToggle={handleDashboardFavoriteToggle}
                        />
                      </div>
                      
                      {favorite.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{favorite.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {favorite.provider_name && (
                            <p className="text-sm font-medium text-gray-700">{favorite.provider_name}</p>
                          )}
                          {favorite.category && (
                            <p className="text-xs text-gray-500">{favorite.category}</p>
                          )}
                        </div>
                        {favorite.price && (
                          <p className="text-lg font-bold text-[#5EB47C]">${favorite.price}</p>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Link
                          to={favorite.listing_type === 'product' 
                            ? `/product/${favorite.listing_id}` 
                            : `/provider/${favorite.provider_id || favorite.listing_id}`
                          }
                          className="inline-flex items-center text-sm text-[#5EB47C] hover:text-[#4A9A64] font-medium"
                        >
                          View Details
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                  <p className="text-sm text-gray-600">Manage your personal information and account details</p>
                </div>
                <div className="w-12 h-12 bg-[#E5F4F1] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#5EB47C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Profile Photo Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          return;
                        }
                        
                        try {
                          setUploadingPhoto(true);
                          
                          // Create unique filename
                          const fileExt = file.name.split('.').pop();
                          const fileName = `profile-photos/profile-${user.id}-${Date.now()}.${fileExt}`;
                          
                                                     // Upload to Supabase Storage
                           const { error: uploadError } = await supabase.storage
                            .from(STORAGE_BUCKETS.PET_OWNERS)
                            .upload(fileName, file, {
                              cacheControl: '3600',
                              upsert: false
                            });
                          
                          if (uploadError) {
                            throw uploadError;
                          }
                          
                          // Get public URL
                          const { data: { publicUrl } } = supabase.storage
                            .from(STORAGE_BUCKETS.PET_OWNERS)
                            .getPublicUrl(fileName);
                          
                          // Update profile with photo URL
                          const { error: updateError } = await supabase
                            .from('profiles')
                            .update({
                              avatar_url: publicUrl,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', user.id);
                          
                          if (updateError) {
                            throw updateError;
                          }
                          
                          setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
                          alert('Profile photo updated successfully!');
                          
                        } catch (error) {
                          alert(`Failed to upload photo: ${error.message || 'Unknown error'}. Please try again.`);
                        } finally {
                          setUploadingPhoto(false);
                          e.target.value = ''; // Reset file input
                        }
                      }}
                      className="hidden"
                      id="profile-photo-upload"
                      disabled={uploadingPhoto}
                    />
                    <label
                      htmlFor="profile-photo-upload"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EB47C] ${
                        uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    {profile?.avatar_url && (
                      <button
                        onClick={async () => {
                          try {
                            // Remove photo URL from profile
                            const { error } = await supabase
                              .from('profiles')
                              .update({
                                avatar_url: null,
                                updated_at: new Date().toISOString()
                              })
                              .eq('id', user.id);
                            
                            if (error) throw error;
                            
                            setProfile(prev => ({ ...prev, avatar_url: null }));
                            alert('Profile photo removed successfully!');
                            
                          } catch (error) {
                            alert('Failed to remove photo. Please try again.');
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                        disabled={uploadingPhoto}
                      >
                        Remove Photo
                      </button>
                    )}
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profile?.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
                    placeholder="City, State"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('profiles')
                        .update({
                          full_name: profile?.full_name,
                          phone: profile?.phone,
                          location: profile?.location,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', user.id);
                      
                      if (error) throw error;
                      
                      // Refresh the profile data to show updated changes
                      await loadUserData();
                      alert('Profile updated successfully!');
                    } catch (error) {
                      alert('Failed to update profile. Please try again.');
                    }
                  }}
                  className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security & Password</h3>
                  <p className="text-sm text-gray-600">Manage your account security and password</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Last updated: Never</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                          redirectTo: `${window.location.origin}/reset-password`
                        });
                        
                        if (error) throw error;
                        alert('Password reset email sent! Check your inbox.');
                      } catch (error) {
                        alert('Failed to send password reset email. Please try again.');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Reset Password
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-sm text-gray-600">Choose what notifications you want to receive</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a3 3 0 10-6 0v3l-5 5h5a3 3 0 006 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Health Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified about vaccination due dates and health reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-600">Receive reminders about upcoming appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">Receive updates about new features and promotions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5EB47C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5EB47C]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Subscription & Billing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Subscription & Billing</h3>
                  <p className="text-sm text-gray-600">Manage your subscription and billing information</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Current Plan</h4>
                    <p className="text-sm text-gray-600 capitalize">{userPlan} Plan</p>
                    {userPlan === 'free' && (
                      <p className="text-xs text-orange-600 mt-1">Limited features - Upgrade for unlimited access</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {userPlan === 'free' ? (
                      <Link
                        to="/pricing"
                        className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors text-sm font-medium"
                      >
                        Upgrade to Premium
                      </Link>
                    ) : (
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                        Manage Subscription
                      </button>
                    )}
                  </div>
                </div>
                
                {totalSpentOnExtras > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Extra Purchases</h4>
                    <p className="text-sm text-yellow-700">
                      You've spent ${totalSpentOnExtras.toFixed(2)} on extra Luni Triage sessions this month
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Consider upgrading to Premium for unlimited access and save money!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                  <p className="text-sm text-red-600">Irreversible and destructive actions</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Export Data</h4>
                    <p className="text-sm text-red-700">Download all your pet data and health records</p>
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Export Data
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your pets, health records, and account data.')) {
                        if (window.confirm('This is your final warning. Are you absolutely sure you want to delete your account?')) {
                          alert('Account deletion is not yet implemented. Please contact support for assistance.');
                        }
                      }
                    }}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Record Form Modal */}
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

        {/* Edit Health Record Form Modal */}
        {showEditHealthRecordForm && selectedHealthRecordForEdit && (
          <EditHealthRecordForm
            record={selectedHealthRecordForEdit}
            onClose={() => {
              setShowEditHealthRecordForm(false);
              setSelectedHealthRecordForEdit(null);
            }}
            onSuccess={handleHealthRecordUpdate}
          />
        )}

        {/* Add/Edit Pet Form Modal */}
        {showAddPetForm && user && (
          <AddPetForm
            onClose={handlePetFormClose}
            onSuccess={handlePetFormSuccess}
            userId={user.id}
            editingPet={editingPet}
          />
        )}

        {/* Pet Selection Modal for Add Record */}
        {showPetSelectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Pet for Health Record</h3>
                  <button
                    onClick={() => setShowPetSelectionModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => handlePetSelection(pet)}
                      className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-[#E5F4F1] rounded-lg border border-gray-200 hover:border-[#5EB47C] transition-all duration-200 text-left"
                    >
                      <div className="w-12 h-12 bg-[#E5F4F1] rounded-full flex items-center justify-center flex-shrink-0">
                        {pet.photo_url ? (
                          <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <PetIcon species={pet.species} className="w-6 h-6" color="#5EB47C" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{pet.name}</h4>
                        <p className="text-sm text-gray-500 capitalize truncate">{pet.breed || pet.species}</p>
                        <p className="text-xs text-gray-400">
                          {(healthRecordsData[pet.id] || []).length} health records
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extra Case Purchase Modal */}
        <ExtraCasePurchaseModal 
          isOpen={showExtraCaseModal}
          onClose={() => setShowExtraCaseModal(false)}
        />
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col space-y-2 sm:space-y-3 z-50">
          {/* Emergency/AI Triage Button */}
          {canUseAiTriage() && canCreateCaseThisWeek() ? (
            <Link
              to="/luni-triage"
              className="group bg-red-500 hover:bg-red-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
              title={`Emergency AI Health Check${userPlan === 'free' ? ` (${getRemainingFreeCasesThisWeek()} free cases left this week)` : ''}`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              {userPlan === 'free' && getRemainingFreeCasesThisWeek() !== 'Unlimited' && getRemainingFreeCasesThisWeek() <= 1 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getRemainingFreeCasesThisWeek()}
                </span>
              )}
            </Link>
          ) : canUseAiTriage() && !canCreateCaseThisWeek() ? (
            <button
              onClick={() => setShowExtraCaseModal(true)}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
              title="Buy Extra Case - $2.99"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 rounded-full font-bold">
                $2.99
              </span>
            </button>
          ) : (
            <Link
              to="/pricing"
              className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Upgrade for AI Health Check"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          )}



          {/* Main FAB with expandable menu */}
          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="bg-gray-800 hover:bg-gray-900 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center lg:hidden"
              title="Quick Actions"
            >
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${showMobileMenu ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Quick Actions Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMobileMenu(false)}>
            <div className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 bg-white rounded-lg shadow-xl p-3 sm:p-4 min-w-44 sm:min-w-48">
              <div className="space-y-3">
                {canUseAiTriage() && canCreateCaseThisWeek() ? (
                  <Link
                    to="/luni-triage"
                    className="flex items-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <div>
                      <div>Emergency Health Check</div>
                      {userPlan === 'free' && getRemainingFreeCasesThisWeek() !== 'Unlimited' && (
                        <div className="text-xs text-gray-500">{getRemainingFreeCasesThisWeek()} free cases left this week</div>
                      )}
                    </div>
                  </Link>
                ) : canUseAiTriage() && !canCreateCaseThisWeek() ? (
                  <button
                    onClick={() => {
                      setShowExtraCaseModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full p-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <div>
                      <div>Emergency Health Check</div>
                      <div className="text-xs text-gray-500">Buy extra Luni Triage - $2.99</div>
                    </div>
                  </button>
                ) : (
                  <Link
                    to="/pricing"
                    className="flex items-center p-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade for AI Health
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleAddPet();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full p-3 text-gray-700 hover:bg-[#E5F4F1] hover:text-[#5EB47C] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Pet
                </button>
                <Link
                  to="/marketplace"
                  className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Marketplace
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  My Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Health Score Help Modal */}
        {showHealthScoreHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {selectedPetForHealthHelp ? (
                        <PetIcon species={selectedPetForHealthHelp.species} className="w-6 h-6" color="#3B82F6" />
                      ) : (
                        <HealthIcon type="chart" className="w-6 h-6" color="#3B82F6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                        {selectedPetForHealthHelp ? (
                          `${selectedPetForHealthHelp.name}'s Health Score`
                        ) : (
                          'Pet Health Score Guide'
                        )}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {selectedPetForHealthHelp ? (
                          `Current Score: ${petHealthStats[selectedPetForHealthHelp.id]?.healthScore || 'Loading...'}/100 (${petHealthStats[selectedPetForHealthHelp.id]?.healthGrade || 'N/A'})`
                        ) : (
                          'Understanding health scores and how to improve them'
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowHealthScoreHelp(false);
                      setSelectedPetForHealthHelp(null);
                    }}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {selectedPetForHealthHelp && petHealthStats[selectedPetForHealthHelp.id] ? (
                  <>
                    {/* Current Score Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {selectedPetForHealthHelp.name}'s Current Health Status
                          </h3>
                          <div className="flex items-center space-x-4">
                            <div className={`px-4 py-2 rounded-full text-lg font-bold ${
                              petHealthStats[selectedPetForHealthHelp.id].healthScore >= 90 ? 'bg-green-100 text-green-800' :
                              petHealthStats[selectedPetForHealthHelp.id].healthScore >= 80 ? 'bg-green-100 text-green-700' :
                              petHealthStats[selectedPetForHealthHelp.id].healthScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              petHealthStats[selectedPetForHealthHelp.id].healthScore >= 60 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {petHealthStats[selectedPetForHealthHelp.id].healthScore}/100
                            </div>
                            <div className="text-2xl font-bold text-gray-700">
                              Grade: {petHealthStats[selectedPetForHealthHelp.id].healthGrade}
                            </div>
                            <div className="text-lg text-gray-600">
                              Status: {petHealthStats[selectedPetForHealthHelp.id].healthStatus}
                            </div>
                          </div>
                        </div>
                        <div className="opacity-10">
                          <PetIcon species={selectedPetForHealthHelp.species} className="w-24 h-24" color="#6B7280" />
                        </div>
                      </div>
                    </div>

                    {/* Factors Affecting This Pet's Score */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        What's Affecting {selectedPetForHealthHelp.name}'s Score
                      </h3>
                      <div className="space-y-3">
                        {petHealthStats[selectedPetForHealthHelp.id].healthFactors?.map((factor, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${
                            factor.impact >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    factor.impact >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {factor.category}
                                  </span>
                                  <span className={`text-sm font-semibold ${
                                    factor.impact >= 0 ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                    {factor.impact >= 0 ? '+' : ''}{factor.impact} points
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{factor.description}</p>
                              </div>
                              <div className={`${factor.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {factor.impact >= 0 ? 
                                  <HealthIcon type="check" className="w-6 h-6" color="currentColor" /> : 
                                  <HealthIcon type="warning" className="w-6 h-6" color="currentColor" />
                                }
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personalized Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        How to Improve {selectedPetForHealthHelp.name}'s Score
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Generate recommendations based on negative factors */}
                        {petHealthStats[selectedPetForHealthHelp.id].healthFactors?.filter(f => f.impact < 0).map((factor, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              Improve {factor.category}
                            </h4>
                            <p className="text-sm text-blue-700 mb-2">{factor.description}</p>
                            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              <strong>Action:</strong> {
                                factor.category === 'Vaccinations' ? 'Schedule a vet visit to update vaccinations' :
                                factor.category === 'Medical Care' ? 'Book a wellness checkup with your vet' :
                                factor.category === 'Weight' ? 'Consult your vet about diet and exercise plan' :
                                factor.category === 'Records' ? 'Add more health records to track progress' :
                                factor.category === 'Medications' ? 'Review medication plan with your vet' :
                                factor.category === 'Emergency Care' ? 'Focus on preventive care to avoid emergencies' :
                                'Consult with your veterinarian'
                              }
                            </div>
                          </div>
                        ))}
                        
                        {/* If no negative factors, show maintenance tips */}
                        {petHealthStats[selectedPetForHealthHelp.id].healthFactors?.filter(f => f.impact < 0).length === 0 && (
                          <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                              <UIIcon type="celebration" className="w-5 h-5 mr-2" color="currentColor" />
                              Great job! {selectedPetForHealthHelp.name} is doing well!
                            </h4>
                            <p className="text-sm text-green-700">
                              Keep up the excellent care by maintaining regular vet visits, 
                              tracking health records, and monitoring for any changes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Score Ranges */}
                    <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Score Ranges & Meanings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-800">90-100 (A+)</span>
                      </div>
                      <p className="text-sm text-green-700">
                        <strong>Excellent:</strong> Outstanding health management. Your pet is in optimal health with all preventive care up to date.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="font-semibold text-green-700">80-89 (A)</span>
                      </div>
                      <p className="text-sm text-green-600">
                        <strong>Very Good:</strong> Great health management with minor areas for improvement.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-semibold text-yellow-800">70-79 (B)</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        <strong>Good:</strong> Decent health management, but some important areas need attention.
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-800">60-69 (C)</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        <strong>Fair:</strong> Multiple health concerns need to be addressed soon.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-semibold text-red-800">50-59 (D)</span>
                      </div>
                      <p className="text-sm text-red-700">
                        <strong>Needs Attention:</strong> Significant health issues require immediate attention.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span className="font-semibold text-red-800">0-49 (F)</span>
                      </div>
                      <p className="text-sm text-red-700">
                        <strong>Poor:</strong> Critical health management issues. Contact your vet immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Factors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Health Factors (How Scores Are Calculated)
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HealthIcon type="vaccination" className="w-5 h-5" color="#3B82F6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Vaccination Status (30% of score)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Keeps your pet protected from serious diseases. Overdue vaccinations significantly impact the score.
                          </p>
                          <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <strong>💡 Tip:</strong> Schedule regular vet visits to stay current on all vaccinations
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HealthIcon type="health" className="w-5 h-5" color="#8B5CF6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Recent Medical Care (20% of score)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Regular checkups help catch issues early. Pets without recent visits (6+ months) lose points.
                          </p>
                          <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <strong>💡 Tip:</strong> Annual checkups for young pets, bi-annual for seniors
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HealthIcon type="weight" className="w-5 h-5" color="#10B981" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Weight Management (15% of score)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Stable weight indicates good health. Significant weight changes may signal health issues.
                          </p>
                          <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <strong>💡 Tip:</strong> Regular weigh-ins and proper diet management
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HealthIcon type="records" className="w-5 h-5" color="#F59E0B" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Health Record Completeness (15% of score)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Complete records help track your pet's health history and identify patterns.
                          </p>
                          <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <strong>💡 Tip:</strong> Add vet visits, vaccinations, and health observations regularly
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HealthIcon type="medication" className="w-5 h-5" color="#EAB308" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Medication Management (10% of score)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Tracks active medications. Many medications may indicate complex health needs.
                          </p>
                          <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <strong>💡 Tip:</strong> Keep medication records updated and follow vet instructions
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HealthIcon type="emergency" className="w-5 h-5" color="#EF4444" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Emergency Care History (10% of score)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Recent emergency visits may indicate underlying health issues or risks.
                          </p>
                          <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <strong>💡 Tip:</strong> Focus on preventive care to avoid emergencies
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Ways to Improve Your Pet's Score
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <HealthIcon type="calendar" className="w-4 h-4 mr-2" color="currentColor" />
                        Schedule Regular Care
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Book annual wellness exams</li>
                        <li>• Update overdue vaccinations</li>
                        <li>• Schedule dental cleanings</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <HealthIcon type="records" className="w-4 h-4 mr-2" color="currentColor" />
                        Keep Complete Records
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Add all vet visits to your records</li>
                        <li>• Track weight changes</li>
                        <li>• Note behavioral changes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                        <UIIcon type="muscle" className="w-4 h-4 mr-2" color="currentColor" />
                        Maintain Healthy Habits
                      </h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Monitor your pet's weight</li>
                        <li>• Provide regular exercise</li>
                        <li>• Feed high-quality diet</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                        <HealthIcon type="search" className="w-4 h-4 mr-2" color="currentColor" />
                        Stay Observant
                      </h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Watch for behavior changes</li>
                        <li>• Monitor eating and drinking</li>
                        <li>• Check for physical changes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <HealthIcon type="warning" className="w-3 h-3" color="#EAB308" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Important Note</h4>
                      <p className="text-sm text-yellow-700">
                        Health scores are educational tools and don't replace professional veterinary advice. 
                        Always consult your veterinarian for medical concerns, regardless of your pet's score.
                      </p>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {selectedPetForHealthHelp ? (
                      `💡 Take action on the recommendations above to improve ${selectedPetForHealthHelp.name}'s health score`
                    ) : (
                      '💡 Click the ? button next to any pet\'s health score for personalized recommendations'
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowHealthScoreHelp(false);
                      setSelectedPetForHealthHelp(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-sm w-full sm:w-auto"
                  >
                    {selectedPetForHealthHelp ? `Help ${selectedPetForHealthHelp.name}!` : 'Got it!'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default PetOwnerDashboardSimple;
