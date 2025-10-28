import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { getUserSafely } from '../lib/supabase-utils.js';
import { useNotificationContext } from '../contexts/NotificationContext';
import ProviderAvailability from './ProviderAvailability';
import StatsOverview from './dashboard/StatsOverview';
import MarketplaceSummary from './dashboard/MarketplaceSummary';
import MarketplaceManager from './dashboard/MarketplaceManager';
import CasesSummary from './dashboard/CasesSummary';
import ErrorBoundary from './common/ErrorBoundary';
import * as Sentry from '@sentry/react';
import { PROVIDER_TYPES } from '../constants/providerTypes';
import { getProviderConfig, getProviderLabels, getProviderNavigation } from '../config/providerConfig';
import { UIIcon } from './MinimalIcons';
import { 
  PRICING_LIMITS, 
  COMMISSION_RATES, 
  MONTHLY_FEES,
  getIndividualPrice, 
  get3PackPrice, 
  get5PackPrice, 
  calculateServiceCommission, 
  calculateProductCommission, 
  getNetEarnings 
} from '../constants/pricingConstants';

// Veterinarian Dashboard - Designed specifically for veterinarians
const VetDashboard = () => {
  const { showInfo, showSuccess, showError } = useNotificationContext();
  const navigate = useNavigate();

  // State management
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [listings, setListings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [triageCases, setTriageCases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Marketplace functionality state variables
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showPayPerListingModal, setShowPayPerListingModal] = useState(false);
  const [payPerListingType, setPayPerListingType] = useState('service');
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // MVP Pricing Constants
  const FREE_SERVICE_LIMIT = 5;
  const FREE_PRODUCT_LIMIT = 5;
  const FREE_PACKAGE_LIMIT = 3; // 3 packages for free users
  const SERVICE_COMMISSION_RATE = 0.18; // 18%
  const PRODUCT_COMMISSION_RATE = 0.10; // 10%
  
  // Monthly Listing Fees (Individual)
  const SERVICE_MONTHLY_FEE = 1.99; // $1.99/month per additional service listing
  const PRODUCT_MONTHLY_FEE = 1.49; // $1.49/month per additional product listing
  const PACKAGE_MONTHLY_FEE = 2.49; // $2.49/month per additional package listing
  
  // Yearly Listing Fees (Individual - 2 months free = ~17% off)
  const SERVICE_YEARLY_FEE = 19.90; // $19.90/year per service ($1.66/month equivalent)
  const PRODUCT_YEARLY_FEE = 14.90; // $14.90/year per product ($1.24/month equivalent)
  const PACKAGE_YEARLY_FEE = 24.90; // $24.90/year per package ($2.08/month equivalent)
  
  // Bundle Monthly Fees (Better Value)
  const SERVICE_3_PACK_MONTHLY = 4.99;   // 3 services for $4.99/month ($1.66 each)
  const SERVICE_5_PACK_MONTHLY = 7.99;   // 5 services for $7.99/month ($1.60 each)
  const PRODUCT_3_PACK_MONTHLY = 3.99;   // 3 products for $3.99/month ($1.33 each)
  const PRODUCT_5_PACK_MONTHLY = 5.99;   // 5 products for $5.99/month ($1.20 each)
  const PACKAGE_3_PACK_MONTHLY = 6.99;   // 3 packages for $6.99/month ($2.33 each)
  const PACKAGE_5_PACK_MONTHLY = 9.99;   // 5 packages for $9.99/month ($2.00 each)
  
  // Bundle Yearly Fees (Best Value - 2 months free = ~17% off)
  const SERVICE_3_PACK_YEARLY = 49.90;   // 3 services for $49.90/year ($4.16/month equivalent)
  const SERVICE_5_PACK_YEARLY = 79.90;   // 5 services for $79.90/year ($6.66/month equivalent)
  const PRODUCT_3_PACK_YEARLY = 39.90;   // 3 products for $39.90/year ($3.33/month equivalent)
  const PRODUCT_5_PACK_YEARLY = 59.90;   // 5 products for $59.90/year ($4.99/month equivalent)
  const PACKAGE_3_PACK_YEARLY = 69.90;   // 3 packages for $69.90/year ($5.83/month equivalent)
  const PACKAGE_5_PACK_YEARLY = 99.90;   // 5 packages for $99.90/year ($8.33/month equivalent)

  // Product form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Accessories', // Default to Accessories
    brand: '',
    stockQuantity: '',
    photos: [],
    specifications: ''
  });

  // Profile form states
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    description: '',
    serviceAreas: '',
    maxTravelDistance: '25',
    yearsOfExperience: '',
    profilePicture: ''
  });
  const [formInitialized, setFormInitialized] = useState(false);

  // Veterinarian-specific configuration
  const providerType = PROVIDER_TYPES.VETERINARIAN;
  const providerConfig = getProviderConfig(providerType);
  const providerLabels = getProviderLabels(providerType);

  // Pricing helper functions
  const getIndividualPrice = (type) => {
    if (billingPeriod === 'yearly') {
      return type === 'service' ? SERVICE_YEARLY_FEE : 
             type === 'product' ? PRODUCT_YEARLY_FEE : 
             PACKAGE_YEARLY_FEE;
    }
    return type === 'service' ? SERVICE_MONTHLY_FEE : 
           type === 'product' ? PRODUCT_MONTHLY_FEE : 
           PACKAGE_MONTHLY_FEE;
  };

  const get3PackPrice = (type) => {
    if (billingPeriod === 'yearly') {
      return type === 'service' ? SERVICE_3_PACK_YEARLY : 
             type === 'product' ? PRODUCT_3_PACK_YEARLY : 
             PACKAGE_3_PACK_YEARLY;
    }
    return type === 'service' ? SERVICE_3_PACK_MONTHLY : 
           type === 'product' ? PRODUCT_3_PACK_MONTHLY : 
           PACKAGE_3_PACK_MONTHLY;
  };

  const get5PackPrice = (type) => {
    if (billingPeriod === 'yearly') {
      return type === 'service' ? SERVICE_5_PACK_YEARLY : 
             type === 'product' ? PRODUCT_5_PACK_YEARLY : 
             PACKAGE_5_PACK_YEARLY;
    }
    return type === 'service' ? SERVICE_5_PACK_MONTHLY : 
           type === 'product' ? PRODUCT_5_PACK_MONTHLY : 
           PACKAGE_5_PACK_MONTHLY;
  };

  // Commission calculation functions
  const calculateServiceCommission = (price) => {
    return (parseFloat(price) * SERVICE_COMMISSION_RATE).toFixed(2);
  };

  const calculateProductCommission = (price) => {
    return (parseFloat(price) * PRODUCT_COMMISSION_RATE).toFixed(2);
  };

  const getNetEarnings = (price, isProduct = false) => {
    const commission = isProduct ? calculateProductCommission(price) : calculateServiceCommission(price);
    return (parseFloat(price) - parseFloat(commission)).toFixed(2);
  };

  // Helper function to filter only services (exclude products and packages)
  const getServicesOnly = (listings) => {
    return listings.filter(listing => {
      // Explicitly check for service type
      return listing.listing_type === 'service' || 
             (listing.listing_type !== 'product' && 
              listing.listing_type !== 'package' && 
              (listing.service_types || listing.service_type) !== 'product' && 
              (listing.service_types || listing.service_type) !== 'package');
    });
  };

  // Helper functions for marketplace
  const handleAddNewService = () => {
    const currentServiceCount = getServicesOnly(listings).length;
    const isFreeTier = !providerData?.subscription_plan || providerData?.subscription_plan === 'free';
    
    if (isFreeTier && currentServiceCount >= FREE_SERVICE_LIMIT) {
      setPayPerListingType('service');
      setShowPayPerListingModal(true);
      return;
    }
    
    setShowCreateServiceModal(true);
  };

  const handleAddProductModal = () => {
    const currentProductCount = products.length;
    const isFreeTier = !providerData?.subscription_plan || providerData?.subscription_plan === 'free';
    
    if (isFreeTier && currentProductCount >= FREE_PRODUCT_LIMIT) {
      setPayPerListingType('product');
      setShowPayPerListingModal(true);
      return;
    }
    
    setShowAddProductModal(true);
  };

  const handleAddNewPackage = () => {
    const isFreeTier = !providerData?.subscription_plan || providerData?.subscription_plan === 'free';
    
    if (isFreeTier && packages.length >= FREE_PACKAGE_LIMIT) {
      setPayPerListingType('package');
      setShowPayPerListingModal(true);
      return;
    }
    
    setShowPackageModal(true);
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"?`)) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('listing_id', serviceId)
        .eq('provider_email', user.email);

      if (error) throw error;

      const updatedListings = listings.filter(listing => listing.listing_id !== serviceId);
      setListings(updatedListings);
      showSuccess('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      showError(`Error deleting service: ${error.message}`);
    }
  };

  // Alias for marketplace section compatibility
  const handleDeleteListing = handleDeleteService;

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('listing_id', productId)
        .eq('provider_email', user.email)
        .eq('listing_type', 'product');

      if (error) throw error;

      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      showSuccess('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      showError(`Error deleting product: ${error.message}`);
    }
  };

  const handleDeletePackage = async (packageId, packageName) => {
    if (!window.confirm(`Are you sure you want to delete "${packageName}"?`)) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId)
        .eq('provider_id', user.id);

      if (error) throw error;

      const updatedPackages = packages.filter(p => p.id !== packageId);
      setPackages(updatedPackages);
      showSuccess('Package deleted successfully');
    } catch (error) {
      console.error('Error deleting package:', error);
      showError(`Error deleting package: ${error.message}`);
    }
  };

  // Product management functions
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stockQuantity) {
      showError('Please fill in all required fields (name, price, category, stock quantity)');
      return;
    }

    // Validate price
    const price = parseFloat(productForm.price);
    if (isNaN(price) || price < 0) {
      showError('Please enter a valid price');
      return;
    }

    // Validate stock quantity
    const stock = parseInt(productForm.stockQuantity);
    if (isNaN(stock) || stock < 0) {
      showError('Please enter a valid stock quantity (0 or greater)');
      return;
    }

    const photoDataSize = JSON.stringify(productForm.photos).length;
    if (photoDataSize > 2000000) {
      showError('Photos are too large. Please use smaller images or reduce the number of photos.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check free tier limits (5 products for free users)
      const currentProductCount = products.length;
      const currentProviderData = providerData || profile || {};
      // Default to free tier if no subscription plan is set
      const subscriptionPlan = currentProviderData?.subscription_plan;
      const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';

      if (isFreeTier && currentProductCount >= FREE_PRODUCT_LIMIT && !editingProduct) {
        setPayPerListingType('product');
        setShowPayPerListingModal(true);
        return;
      }

      // Use marketplace_listings instead of separate products table
      const productData = {
        listing_type: 'product',
        listing_id: editingProduct ? (editingProduct.listing_id || editingProduct.id) : window.crypto?.randomUUID?.() || Math.random().toString(36),
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: price,
        category: productForm.category || 'Accessories',
        brand: productForm.brand.trim() || null,
        stock_quantity: stock,
        service_types: 'product',
        provider_email: user.email,
        provider_name: profile?.full_name || providerData?.name || user.email?.split('@')[0],
        provider_type: profile?.provider_type || providerData?.provider_type || 'veterinarian',
        active: true,
        image_url: productForm.photos.length > 0 ? productForm.photos[0].url : null,
        created_at: editingProduct ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let savedProduct;
      if (editingProduct) {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .update(productData)
          .eq('listing_id', editingProduct.listing_id || editingProduct.id)
          .eq('provider_email', user.email)
          .select()
          .single();

        if (error) throw error;
        savedProduct = data;
      } else {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        savedProduct = data;
      }

      // Update local products state with the saved product
      const newProduct = {
        id: savedProduct.listing_id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: savedProduct.price,
        category: savedProduct.category,
        brand: savedProduct.brand,
        stockQuantity: savedProduct.stock_quantity,
        photos: productForm.photos, // Keep the photo objects for display
        specifications: productForm.specifications, // Keep form data since DB doesn't store this
        createdAt: savedProduct.created_at,
        updatedAt: savedProduct.updated_at,
        type: 'product'
      };

      let updatedProducts;
      if (editingProduct) {
        updatedProducts = products.map(p => p.id === editingProduct.id ? newProduct : p);
      } else {
        updatedProducts = [...products, newProduct];
      }

      setProducts(updatedProducts);
      
      // Refresh data to show updated product
      await Promise.all([
        loadListings(user.id),
        loadProducts(user.id)
      ]);

      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'Accessories',
        brand: '',
        stockQuantity: '',
        photos: [],
        specifications: ''
      });
      setShowAddProductModal(false);
      setEditingProduct(null);

      showSuccess(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);

    } catch (error) {
      console.error('Error saving product:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        showError('Error: Product photos are too large. Please use smaller images or reduce the number of photos.');
      } else if (error.message.includes('JSON')) {
        showError('Error: Invalid product data. Please check your inputs and try again.');
      } else {
        showError(`Error saving product: ${error.message}. Please try again.`);
      }
    }
  };

  // Photo handling functions
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxFiles = 4;
    
    if (productForm.photos.length + files.length > maxFiles) {
      showError(`You can only upload up to ${maxFiles} photos`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Check file size (10MB limit per file)
        if (file.size > 10 * 1024 * 1024) {
          showError(`File ${file.name} is too large. Please use images under 10MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          // Create an image to compress it
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions (max 800px width/height)
            let { width, height } = img;
            const maxDimension = 800;
            
            if (width > height) {
              if (width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            const newPhoto = {
              id: Date.now() + Math.random(),
              file: file,
              url: compressedDataUrl,
              name: file.name
            };
            
            setProductForm(prev => ({
              ...prev,
              photos: [...prev.photos, newPhoto]
            }));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        showError('Please select only image files');
      }
    });
  };

  const removePhoto = (photoId) => {
    setProductForm(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  // Initialize form when profile or provider data first loads (but preserve user changes)
  useEffect(() => {
    if ((profile || providerData || user) && !formInitialized) {
      // Prioritize the more complete name (providerData?.name is usually more complete)
      const fullName = (providerData?.name && providerData.name.trim().split(' ').length > 1) 
        ? providerData.name 
        : (profile?.full_name || providerData?.name || user?.email?.split('@')[0] || 'User');

      setProfileForm(prev => ({
        ...prev,
        fullName: fullName,
        phone: providerData?.phone || '',
        address: providerData?.address || '',
        description: providerData?.description || '',
        serviceAreas: providerData?.service_areas || 'Auckland',
        maxTravelDistance: providerData?.max_travel_distance || '25',
        profilePicture: providerData?.profile_picture || profile?.avatar_url || ''
      }));
      setFormInitialized(true);
    }
  }, [profile, providerData, user, formInitialized]);

  // Update product form when editing
  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: (editingProduct.price || 0).toString(),
        category: editingProduct.category || 'Accessories',
        brand: editingProduct.brand || '',
        stockQuantity: (editingProduct.stockQuantity || editingProduct.stock_quantity || 0).toString(),
        photos: editingProduct.photos || [],
        specifications: editingProduct.specifications || ''
      });
    }
  }, [editingProduct]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = await getUserSafely();
      if (!currentUser) {
        console.log('VetDashboard: No user found, redirecting to home');
        navigate('/');
        return;
      }
      
      setUser(currentUser);
      console.log('VetDashboard: User found:', currentUser.email);

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, phone, location, organization')
        .eq('id', currentUser.id)
        .single();

      if (profileError || !profileData) {
        console.log('VetDashboard: No profile data found');
        navigate('/');
        return;
      }
      
      console.log('VetDashboard: Profile data:', profileData);
      
      // Strict role validation - only veterinarians allowed
      if (profileData.role !== 'veterinarian') {
        console.log('VetDashboard: Access denied. Expected: veterinarian, Got:', profileData.role);
        navigate('/');
        return;
      }
      
      console.log('VetDashboard: Access granted for veterinarian');
      setProfile(profileData);

      // Load all dashboard data
      await Promise.all([
        loadProviderData(currentUser.id),
        loadPatients(currentUser.id),
        loadAppointments(currentUser.id),
        loadDiagnoses(currentUser.id),
        loadPrescriptions(currentUser.id),
        loadTriageCases(currentUser.id),
        loadListings(currentUser.id),
        loadProducts(currentUser.id),
        loadPackages(currentUser.id)
      ]);

      // Calculate stats
      calculateDashboardStats();

    } catch (error) {
      console.error('VetDashboard: Error in initialization:', error);
      Sentry.captureException(error);
      showError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadProviderData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setProviderData(data);
      } else {
        // Create default provider profile for veterinarian
        const defaultProvider = {
          id: userId,
          user_id: userId,
          provider_type: 'veterinarian',
          full_name: profile?.full_name || user?.email,
          email: user?.email,
          phone: profile?.phone || null,
          bio: 'Professional veterinarian providing comprehensive medical care for animals.',
          specializations: ['General Practice'],
          years_experience: 0,
          verified: false,
          is_active: true
        };
        setProviderData(defaultProvider);
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
    }
  };

  const loadPatients = async (userId) => {
    try {
      // Get patients only from consultation bookings and appointments
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select(`
          pet_profiles (
            id,
            name,
            species,
            age,
            created_at
          )
        `)
        .eq('provider_id', userId)
        .not('pet_profiles', 'is', null);

      if (error) throw error;
      
      // Extract unique patients from bookings
      const uniquePatients = [];
      const patientIds = new Set();
      
      data?.forEach(booking => {
        if (booking.pet_profiles && !patientIds.has(booking.pet_profiles.id)) {
          patientIds.add(booking.pet_profiles.id);
          uniquePatients.push(booking.pet_profiles);
        }
      });
      
      setPatients(uniquePatients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      // Fallback to empty array
      setPatients([]);
    }
  };

  const loadAppointments = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, pet_profiles(name, species), profiles(full_name)')
        .eq('provider_id', userId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadDiagnoses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*, pet_profiles(name, species)')
        .eq('veterinarian_id', userId)
        .eq('record_type', 'diagnosis')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiagnoses(data || []);
    } catch (error) {
      console.error('Error loading diagnoses:', error);
    }
  };

  const loadPrescriptions = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*, pet_profiles(name, species)')
        .eq('veterinarian_id', userId)
        .eq('record_type', 'prescription')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const loadTriageCases = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .select('*, pet_profiles(name, species)')
        .eq('assigned_vet_id', userId)
        .order('priority', { ascending: false });

      if (error) throw error;
      setTriageCases(data || []);
    } catch (error) {
      console.error('Error loading triage cases:', error);
    }
  };

  const loadListings = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('provider_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const loadProducts = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('provider_email', user.email)
        .eq('listing_type', 'product')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsFromMarketplace = (data || []).map(listing => ({
        id: listing.listing_id,
        name: listing.name,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        brand: listing.brand,
        stockQuantity: listing.stock_quantity,
        photos: listing.image_url ? [{ id: 1, url: listing.image_url, name: 'Product Image' }] : [],
        specifications: ''
      }));
      
      setProducts(productsFromMarketplace);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadPackages = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const calculateDashboardStats = () => {
    const totalPatients = patients.length;
    const todayAppointments = appointments.filter(apt => {
      const today = new Date().toDateString();
      return new Date(apt.scheduled_date).toDateString() === today;
    }).length;
    const urgentCases = triageCases.filter(case_ => case_.priority === 'urgent').length;
    const activePrescriptions = prescriptions.filter(rx => rx.status === 'active').length;

    setStats({
      totalPatients,
      todayAppointments,
      urgentCases,
      activePrescriptions,
      totalDiagnoses: diagnoses.length,
      totalListings: listings.length
    });
  };

  // Veterinarian-specific navigation sections
  const navigationSections = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: <UIIcon type="overview" className="w-5 h-5" />
    },
    { 
      id: 'patients', 
      name: 'Patients', 
      icon: <UIIcon type="patients" className="w-5 h-5" />
    },
    { 
      id: 'appointments', 
      name: 'Bookings', 
      icon: <UIIcon type="appointments" className="w-5 h-5" />
    },
    { 
      id: 'diagnoses', 
      name: 'Diagnoses', 
      icon: <UIIcon type="procedures" className="w-5 h-5" />
    },
    { 
      id: 'prescriptions', 
      name: 'Prescriptions', 
      icon: <UIIcon type="prescriptions" className="w-5 h-5" />
    },
    { 
      id: 'triage', 
      name: 'Triage Cases', 
      icon: <UIIcon type="triageCases" className="w-5 h-5" />
    },
    { 
      id: 'marketplace', 
      name: 'Marketplace', 
      icon: <UIIcon type="marketplace" className="w-5 h-5" />
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: <UIIcon type="analytics" className="w-5 h-5" />
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: <UIIcon type="profile" className="w-5 h-5" />
    }
  ];

  // Render functions for each section
  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="lg:block hidden">
            <p className="text-xl font-bold text-gray-900">Welcome back, Dr. {profile?.full_name || 'Veterinarian'}</p>
          </div>
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="hidden lg:flex px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors items-center text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Manage Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Today's Appointments</p>
                <p className="text-2xl font-bold text-green-900">{stats.todayAppointments || 0}</p>
              </div>
              <UIIcon type="appointments" className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalPatients || 0}</p>
              </div>
              <UIIcon type="patients" className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Urgent Cases</p>
                <p className="text-2xl font-bold text-red-900">{stats.urgentCases || 0}</p>
              </div>
              <UIIcon type="urgentCases" className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Active Prescriptions</p>
                <p className="text-2xl font-bold text-purple-900">{stats.activePrescriptions || 0}</p>
              </div>
              <UIIcon type="prescriptions" className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* First Row - Marketplace Summary and Urgent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketplace Summary */}
        <MarketplaceSummary 
          listings={listings}
          packages={packages}
          products={products}
          setActiveSection={setActiveSection}
        />

        {/* Urgent Cases */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Urgent Cases
          </h3>
          {triageCases.filter(case_ => case_.priority === 'urgent').length === 0 ? (
            <p className="text-gray-500">No urgent cases at the moment</p>
          ) : (
            <div className="space-y-3">
              {triageCases.filter(case_ => case_.priority === 'urgent').slice(0, 3).map((case_) => (
                <div key={case_.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{case_.pet_profiles?.name}</p>
                    <p className="text-sm text-gray-600">{case_.chief_complaint}</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('triage')}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Review →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Second Row - Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Booking
          </h3>
          {appointments.filter(apt => {
            const today = new Date().toDateString();
            return new Date(apt.scheduled_date).toDateString() === today;
          }).length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {appointments.filter(apt => {
                const today = new Date().toDateString();
                return new Date(apt.scheduled_date).toDateString() === today;
              }).slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.pet_profiles?.name}</p>
                    <p className="text-sm text-gray-600">{new Date(appointment.scheduled_date).toLocaleTimeString()}</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('appointments')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPatientsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Patients</h2>

        </div>
        
        {patients.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <UIIcon type="patients" className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-2">No patients from marketplace bookings yet</p>
            <p className="text-sm text-gray-400 mt-1">Patients will appear here when pet owners book your services</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <span className="text-sm text-gray-500">{patient.species}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Age: {patient.age || 'Unknown'}</p>
                <button className="w-full text-sm bg-green-50 text-green-700 py-2 rounded hover:bg-green-100">
                  View Records
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Marketplace Bookings</h2>

        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <UIIcon type="appointments" className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-2">No marketplace bookings yet</p>
            <p className="text-sm text-gray-400 mt-1">Pet owners can book your services through the Luniby marketplace</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.pet_profiles?.name}</h3>
                    <p className="text-sm text-gray-600">Owner: {appointment.profiles?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.scheduled_date).toLocaleDateString()} at {new Date(appointment.scheduled_date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDiagnosesSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Diagnosis & Treatment Plans</h2>

        </div>
        
        {diagnoses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <UIIcon type="diagnosis" className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-2">No diagnoses recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Create diagnoses during marketplace consultations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{diagnosis.pet_profiles?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{diagnosis.diagnosis || diagnosis.notes}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(diagnosis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Edit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPrescriptionsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Prescription Management</h2>

        </div>
        
        {prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <UIIcon type="prescriptions" className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-2">No prescriptions issued yet</p>
            <p className="text-sm text-gray-400 mt-1">Issue prescriptions during marketplace consultations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{prescription.pet_profiles?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{prescription.medication || prescription.notes}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Prescribed: {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prescription.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTriageSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Triage Cases</h2>
        
        {triageCases.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <UIIcon type="triageCases" className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-2">No triage cases assigned</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triageCases.map((case_) => (
              <div key={case_.id} className={`border rounded-lg p-4 ${
                case_.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                case_.priority === 'high' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{case_.pet_profiles?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{case_.chief_complaint}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        case_.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        case_.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {case_.priority} priority
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(case_.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Review Case →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMarketplaceSection = () => (
    <div className="p-6 space-y-0">
      {/* Marketplace Status Container - Full Width */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Marketplace</h3>
            <p className="text-gray-600 text-sm">
              {providerData?.verified 
                ? "Your profile is live and accepting bookings from customers" 
                : listings.length > 0 
                  ? "Ready to publish your services to the marketplace"
                  : "Create services to get started on the marketplace"
              }
            </p>
          </div>
          {!providerData?.verified && listings.length > 0 && (
            <button
              onClick={handleGoLive}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <UIIcon type="rocket" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Go Live on Marketplace</span>
              <span className="sm:hidden">Go Live</span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed Marketplace Section with Limits */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>

            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Services Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-md font-medium text-gray-900">Services</h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {getServicesOnly(listings).length}
                  {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
                    `/${FREE_SERVICE_LIMIT}`
                  }
                </span>
                {getServicesOnly(listings).length > 0 && (
                  <button
                    onClick={() => {
                      window.open('/marketplace', '_blank');
                    }}
                    className="inline-flex items-center text-gray-500 hover:text-green-600 text-xs font-medium"
                    title="View Service Listings"
                  >
                    <UIIcon type="search" className="w-4 h-4 mr-1" />
                    View Listing
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
                  getServicesOnly(listings).length >= FREE_SERVICE_LIMIT && (
                  <span className="text-xs text-green-600 font-medium">
                    At limit - ${SERVICE_MONTHLY_FEE}/month each
                  </span>
                )}
                <button 
                  onClick={handleAddNewService} 
                  className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <UIIcon type="plus" className="w-4 h-4 mr-2" />
                  Add Service
                </button>
              </div>
            </div>
            
            {getServicesOnly(listings).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getServicesOnly(listings).map((listing) => (
                  <div key={listing.listing_id || listing.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{listing.name || listing.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{listing.description}</p>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === `service-${listing.listing_id || listing.id}` ? null : `service-${listing.listing_id || listing.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="More options"
                        >
                          <UIIcon type="menu" className="w-4 h-4" />
                        </button>
                        
                        {openDropdown === `service-${listing.listing_id || listing.id}` && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setEditingService(listing);
                                  setShowEditServiceModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteService(listing.listing_id || listing.id, listing.name || listing.title);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-semibold text-green-600">${listing.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Commission:</span>
                        <span className="text-xs text-gray-500">${calculateServiceCommission(listing.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">You earn:</span>
                        <span className="text-sm font-medium text-gray-900">${getNetEarnings(listing.price)}</span>
                      </div>
                      {listing.active !== undefined && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            listing.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {listing.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UIIcon type="listings" className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services added yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first veterinary service to start earning on the marketplace.
                </p>

              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-md font-medium text-gray-900">Products</h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {products.length}
                  {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
                    `/${FREE_PRODUCT_LIMIT}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
                  products.length >= FREE_PRODUCT_LIMIT && (
                  <span className="text-xs text-green-600 font-medium">
                    At limit - ${PRODUCT_MONTHLY_FEE}/month each
                  </span>
                )}
                <button 
                  onClick={handleAddProductModal} 
                  className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <UIIcon type="plus" className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mt-1">Brand: {product.brand}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-semibold text-blue-600">${product.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Commission:</span>
                        <span className="text-xs text-gray-500">${calculateProductCommission(product.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">You earn:</span>
                        <span className="text-sm font-medium text-gray-900">${getNetEarnings(product.price, true)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`text-xs font-medium ${
                          (product.stockQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(product.stockQuantity || 0) > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UIIcon type="products" className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products added yet</h3>
                <p className="text-gray-600 mb-4">
                  Add veterinary products to sell alongside your services.
                </p>

              </div>
            )}
          </div>

          {/* Packages Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-md font-medium text-gray-900">Packages</h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {packages.length}
                  {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
                    `/${FREE_PACKAGE_LIMIT}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
                  packages.length >= FREE_PACKAGE_LIMIT && (
                  <span className="text-xs text-purple-600 font-medium">
                    At limit - ${PACKAGE_MONTHLY_FEE}/month each
                  </span>
                )}
                <button 
                  onClick={handleAddNewPackage} 
                  className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <UIIcon type="plus" className="w-4 h-4 mr-2" />
                  Add Package
                </button>
              </div>
            </div>
            
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-600">{pkg.service_ids?.length || 0} services included</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Package Price:</span>
                        <span className="font-semibold text-purple-600">${pkg.package_price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <UIIcon type="package" className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No packages created yet</h3>
                <p className="text-gray-600 mb-4">
                  Bundle services together to offer better value to customers.
                </p>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Go Live function - publishes provider profile to marketplace
  const handleGoLive = async () => {
    try {
      const currentUser = await getUserSafely();
      if (!currentUser) {
        showError('User not authenticated');
        return;
      }

      // Check if provider record exists
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id, verified')
        .eq('id', currentUser.id)
        .single();

      if (existingProvider) {
        // Update existing provider to be verified/live
        const { error: updateError } = await supabase
          .from('providers')
          .update({ verified: true, is_active: true })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;
        
        showSuccess('🎉 Your profile is now live on the marketplace! You can view it using "View My Listing".');
      } else {
        // Create new provider record
        const providerProfile = profile || {};
        const newProviderData = {
          id: currentUser.id,
          name: providerProfile?.full_name || currentUser.email,
          email: currentUser.email,
          phone: providerProfile?.phone || null,
          provider_type: 'veterinarian',
          business_name: providerProfile?.business_name || null,
          address: null,
          city: 'Location TBD',
          country: 'Australia',
          bio: 'Professional veterinarian providing comprehensive medical care for animals.',
          offers_services: true,
          offers_products: false,
          verified: true, // Live on marketplace
          is_active: true,
          featured: false,
          rating: 0.00,
          reviews_count: 0,
          profile_image_url: null,
          service_types: ['Veterinary Services']
        };

        const { error: insertError } = await supabase.from('providers').insert(newProviderData);
        if (insertError) throw insertError;

        showSuccess('🎉 Your profile is now live on the marketplace! You can view it using "View My Listing".');
      }

      // Update all services to be verified/active
      const { error: servicesError } = await supabase
        .from('marketplace_listings')
        .update({ verified: true, active: true })
        .eq('provider_email', currentUser.email);

      if (servicesError) {
        console.error('Error updating services:', servicesError);
      }

      // Reload data to reflect changes
      await initializeDashboard();
      
    } catch (error) {
      console.error('Error going live:', error);
      showError('Failed to go live: ' + error.message);
    }
  };

  // Service creation handler
  const handleCreateService = async (serviceData) => {
    try {
      const currentUser = await getUserSafely();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get provider data first
      const currentProviderData = providerData || profile || {};
      
      // Check free tier limits (5 services for free users)
      const currentServiceCount = getServicesOnly(listings).length;
      const subscriptionPlan = currentProviderData?.subscription_plan;
      const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';

      if (isFreeTier && currentServiceCount >= FREE_SERVICE_LIMIT) {
        showError(`Free tier limit reached! You can have up to ${FREE_SERVICE_LIMIT} services. Click "Upgrade to Premium" to get unlimited services.`);
        return;
      }
      
      const insertData = {
        listing_type: 'service',
        listing_id: window.crypto?.randomUUID?.() || Math.random().toString(36),
        name: serviceData.title,
        description: serviceData.description,
        service_types: serviceData.service_type,
        price: parseFloat(serviceData.price),
        provider_name: currentProviderData?.full_name || currentUser.email,
        provider_type: 'veterinarian',
        provider_email: currentUser.email,
        provider_phone: currentProviderData?.phone || 'N/A',
        active: true,
        verified: false,
        rating: 0.0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(insertData)
        .select();
        
      if (error) {
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      
      showSuccess('Service created successfully!');
      setShowCreateServiceModal(false);
      await loadListings(currentUser.id); // Refresh data
    } catch (error) {
      console.error('Error creating service:', error);
      showError(`Failed to create service: ${error.message}`);
    }
  };

  // Service editing handler
  const handleUpdateService = async (serviceData) => {
    try {
      const updateData = {
        name: serviceData.title,
        description: serviceData.description,
        service_types: serviceData.service_type,
        price: parseFloat(serviceData.price),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('marketplace_listings')
        .update(updateData)
        .eq('listing_id', editingService.listing_id || editingService.id);

      if (error) {
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      
      showSuccess('Service updated successfully!');
      setShowEditServiceModal(false);
      setEditingService(null);
      await loadListings(user.id); // Refresh data
    } catch (error) {
      console.error('Error updating service:', error);
      showError(`Failed to update service: ${error.message}`);
    }
  };

  // Role-based service options
  const getServiceOptions = (providerType) => {
    const baseServices = [
      { value: "Mobile Consultation", label: "Mobile Consultation" },
      { value: "Mobile Emergency Care", label: "Mobile Emergency Care" }
    ];
    
    // Veterinarian services
    return [
      ...baseServices,
      { value: "Clinic Consultation", label: "Clinic Consultation" },
      { value: "Surgery Services", label: "Surgery Services" },
      { value: "Diagnostic Testing", label: "Diagnostic Testing" },
      { value: "Preventive Care", label: "Preventive Care" },
      { value: "Dental Care", label: "Dental Care" },
      { value: "Orthopedic Care", label: "Orthopedic Care" },
      { value: "Laboratory Services", label: "Laboratory Services" },
      { value: "Telemedicine Consultation", label: "Telemedicine Consultation" },
      { value: "Emergency Surgery", label: "Emergency Surgery" },
      { value: "Specialist Referral", label: "Specialist Referral" },
      { value: "Prescription Management", label: "Prescription Management" },
      { value: "Vaccination Programs", label: "Vaccination Programs" }
    ];
  };

  // Service edit component
  const ServiceEditForm = ({ service, onClose }) => {
    const [serviceData, setServiceData] = useState({
      title: service.name || service.title || '',
      description: service.description || '',
      price: service.price || service.price_from || '',
      service_type: service.service_types || service.service_type || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      await handleUpdateService(serviceData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Service</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
              <input
                type="text"
                required
                value={serviceData.title}
                onChange={(e) => setServiceData({...serviceData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Veterinary Consultation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
              <select
                required
                value={serviceData.service_type}
                onChange={(e) => setServiceData({...serviceData, service_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select service type</option>
                {getServiceOptions('veterinarian').map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={serviceData.price}
                onChange={(e) => setServiceData({...serviceData, price: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="150.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={serviceData.description}
                onChange={(e) => setServiceData({...serviceData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe your service..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <UIIcon type="check" className="w-4 h-4 mr-2" />
                Update Service
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Service creation component
  const ServiceCreateForm = ({ onClose }) => {
    const [serviceData, setServiceData] = useState({
      title: '',
      description: '',
      price: '',
      service_type: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      await handleCreateService(serviceData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Create New Service</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
              <input
                type="text"
                required
                value={serviceData.title}
                onChange={(e) => setServiceData({...serviceData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Veterinary Consultation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
              <select
                required
                value={serviceData.service_type}
                onChange={(e) => setServiceData({...serviceData, service_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select service type</option>
                {getServiceOptions('veterinarian').map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={serviceData.price}
                onChange={(e) => setServiceData({...serviceData, price: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="150.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={serviceData.description}
                onChange={(e) => setServiceData({...serviceData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe your service..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <UIIcon type="plus" className="w-4 h-4 mr-2" />
                Create Service
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Veterinarian Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{profile?.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Practice/Organization</label>
                <p className="text-gray-900">{profile?.organization || 'Not set'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Practice Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Specializations</label>
                <p className="text-gray-900">{providerData?.specializations?.join(', ') || 'General Practice'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                <p className="text-gray-900">{providerData?.years_experience || 0} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">License Status</label>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  providerData?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {providerData?.verified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSection = () => {
    // Calculate financial metrics
    const calculateRevenue = () => {
      const completedBookings = appointments.filter(apt => apt.status === 'completed');
      const serviceRevenue = completedBookings.reduce((total, appointment) => {
        // Estimate revenue from appointments
        const estimatedPrice = 150; // Average vet consultation price
        const netEarnings = estimatedPrice * 0.85; // 15% platform fee
        return total + netEarnings;
      }, 0);

      // Estimate product revenue (since we don't have actual sales data)
      const productRevenue = listings.length * 25; // Estimated average monthly revenue per listing

      // Package revenue estimation
      const packageRevenue = listings.filter(l => l.active).reduce((total, listing) => {
        const price = parseFloat(listing.price_from || listing.price || 0);
        return total + (price * 0.1); // Estimated 10% of listing price as monthly package revenue
      }, 0);

      return {
        total: serviceRevenue + productRevenue + packageRevenue,
        services: serviceRevenue,
        products: productRevenue,
        packages: packageRevenue
      };
    };

    const revenue = calculateRevenue();
    const thisMonthAppointments = appointments.filter(apt => {
      const appointmentDate = new Date(apt.created_at);
      const now = new Date();
      return appointmentDate.getMonth() === now.getMonth() && appointmentDate.getFullYear() === now.getFullYear();
    });

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Analytics</h3>
          <p className="text-sm text-gray-600">
            Track your earnings from consultations, services, and products. All figures show net earnings after platform fees.
          </p>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-600">Total Earnings</h4>
              <UIIcon type="earnings" className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-900">${revenue.total.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">Net earnings (after fees)</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-600">Consultation Revenue</h4>
              <UIIcon type="consultation" className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900">${revenue.services.toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-1">{appointments.filter(apt => apt.status === 'completed').length} completed consultations</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-orange-600">Service Listings</h4>
              <UIIcon type="listings" className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-900">${revenue.products.toFixed(2)}</p>
            <p className="text-xs text-orange-600 mt-1">{listings.length} services listed</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-purple-600">Package Revenue</h4>
              <UIIcon type="package" className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-900">${revenue.packages.toFixed(2)}</p>
            <p className="text-xs text-purple-600 mt-1">{listings.filter(l => l.active).length} active listings</p>
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Consultations</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">${revenue.services.toFixed(2)}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${revenue.total > 0 ? (revenue.services / revenue.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Services</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">${revenue.products.toFixed(2)}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${revenue.total > 0 ? (revenue.products / revenue.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-300 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Packages</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">${revenue.packages.toFixed(2)}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-300 h-2 rounded-full" 
                      style={{ width: `${revenue.total > 0 ? (revenue.packages / revenue.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultation Success Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {appointments.length > 0 ? Math.round((appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Service Price</span>
                <span className="text-sm font-bold text-gray-900">
                  ${listings.length > 0 ? (listings.reduce((sum, l) => sum + parseFloat(l.price_from || 0), 0) / listings.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month Appointments</span>
                <span className="text-sm font-bold text-green-600">{thisMonthAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Listings</span>
                <span className="text-sm font-bold text-gray-900">{listings.filter(l => l.active).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patient Rating</span>
                <span className="text-sm font-bold text-yellow-600">
                  {stats.averageRating > 0 ? (
                    <span className="flex items-center">
                      {stats.averageRating}
                      <UIIcon type="rating" className="w-4 h-4 text-yellow-500 ml-1" />
                    </span>
                  ) : 'No ratings yet'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h4>
          {appointments.filter(apt => apt.status === 'completed').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.filter(apt => apt.status === 'completed').slice(0, 5).map((appointment) => {
                    const estimatedPrice = 150; // Average vet consultation price
                    const earnings = (estimatedPrice * 0.85).toFixed(2); // 15% platform fee
                    
                    return (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.consultation_type || 'Veterinary Consultation'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.pet_profiles?.name || 'Patient'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appointment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${earnings}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <UIIcon type="earnings" className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed transactions yet</h3>
              <p className="text-gray-500">
                Once you complete consultations, your earnings will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Earning Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Tips to Increase Earnings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <UIIcon type="growth" className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">Offer Specialized Services</h5>
                <p className="text-sm text-gray-600">Provide specialized veterinary services for higher-value consultations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <UIIcon type="rating" className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">Maintain High Ratings</h5>
                <p className="text-sm text-gray-600">Better ratings lead to more bookings and higher consultation fees</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <UIIcon type="products" className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">Recommend Products</h5>
                <p className="text-sm text-gray-600">Recommend veterinary products for additional income</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <UIIcon type="availability" className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900">Increase Availability</h5>
                <p className="text-sm text-gray-600">More availability means more consultation opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Package creation component
  const PackageForm = ({ isEdit = false, initialData = {}, onClose }) => {
    const [packageData, setPackageData] = useState({
      name: initialData.name || '',
      description: initialData.description || '',
      selectedServices: initialData.service_ids || [],
      packagePrice: initialData.package_price || '',
      isActive: initialData.is_active !== undefined ? initialData.is_active : true
    });

    const handleServiceToggle = (serviceId) => {
      setPackageData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.includes(serviceId)
          ? prev.selectedServices.filter(id => id !== serviceId)
          : [...prev.selectedServices, serviceId]
      }));
    };

    const getOriginalPrice = () => {
      return getServicesOnly(listings)
        .filter(service => packageData.selectedServices.includes(service.listing_id || service.id))
        .reduce((total, service) => total + parseFloat(service.price || service.price_from || 0), 0);
    };

    const getSavings = () => {
      const original = getOriginalPrice();
      const packagePrice = parseFloat(packageData.packagePrice || 0);
      return original - packagePrice;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!isEdit && packageData.selectedServices.length < 2) {
        showError('Please select at least 2 services for a package');
        return;
      }

      try {
        const currentUser = await getUserSafely();
        if (!currentUser) throw new Error('User not authenticated');

        // Check free tier limits (3 packages for free users)
        const currentPackageCount = packages.length;
        const currentProviderData = providerData || profile || {};
        const subscriptionPlan = currentProviderData?.subscription_plan;
        const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';

        const packageInfo = {
          listing_type: 'package',
          listing_id: isEdit ? initialData.id : window.crypto?.randomUUID?.() || Math.random().toString(36),
          name: packageData.name,
          description: packageData.description,
          price: parseFloat(packageData.packagePrice),
          service_types: 'package',
          provider_email: currentUser.email,
          provider_name: profile?.full_name || providerData?.name || currentUser.email?.split('@')[0],
          provider_type: 'veterinarian',
          active: packageData.isActive,
          verified: false,
          rating: 0.0,
          reviews_count: 0,
          created_at: isEdit ? undefined : new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Save to marketplace_listings
        let savedPackage;
        if (isEdit) {
          const { data, error } = await supabase
            .from('marketplace_listings')
            .update(packageInfo)
            .eq('listing_id', initialData.id)
            .eq('provider_email', currentUser.email)
            .select()
            .single();

          if (error) throw error;
          savedPackage = data;
        } else {
          const { data, error } = await supabase
            .from('marketplace_listings')
            .insert([packageInfo])
            .select()
            .single();

          if (error) throw error;
          savedPackage = data;
        }

        // Refresh data to show updated packages
        await Promise.all([
          loadListings(currentUser.id),
          loadPackages(currentUser.id)
        ]);

        showSuccess(`Package ${isEdit ? 'updated' : 'created'} successfully!`);
        onClose();
        
      } catch (error) {
        console.error('Error saving package:', error);
        showError('Failed to save package: ' + error.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Package' : 'Create Package'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                <input
                  type="text"
                  required
                  value={packageData.name}
                  onChange={(e) => setPackageData({...packageData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Complete Veterinary Care Package"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={packageData.packagePrice}
                  onChange={(e) => setPackageData({...packageData, packagePrice: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="250.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={packageData.description}
                onChange={(e) => setPackageData({...packageData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe what's included in this veterinary package..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Select Services *</label>
              {getServicesOnly(listings).length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {getServicesOnly(listings).map((service) => (
                    <div key={service.listing_id || service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`package-service-${service.listing_id || service.id}`}
                          checked={packageData.selectedServices.includes(service.listing_id || service.id)}
                          onChange={() => handleServiceToggle(service.listing_id || service.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`package-service-${service.listing_id || service.id}`} className="ml-3 flex-1">
                          <div className="font-medium text-gray-900">{service.name || service.title}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </label>
                      </div>
                      <div className="font-bold text-gray-900">${service.price || service.price_from}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">You need to create services first before you can bundle them into packages.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      handleAddNewService();
                    }}
                    className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create Your First Service →
                  </button>
                </div>
              )}
            </div>

            {packageData.selectedServices.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">Package Summary</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span>${getOriginalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Package Price:</span>
                    <span>${parseFloat(packageData.packagePrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Customer Saves:</span>
                    <span>${getSavings().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="package-active"
                checked={packageData.isActive}
                onChange={(e) => setPackageData({...packageData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="package-active" className="ml-2 text-sm text-gray-700">
                Make this package available to customers
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isEdit && packageData.selectedServices.length < 2}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium ${
                  (isEdit || packageData.selectedServices.length >= 2)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <UIIcon type="check" className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main render function
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'patients':
        return renderPatientsSection();
      case 'appointments':
        return renderAppointmentsSection();
      case 'diagnoses':
        return renderDiagnosesSection();
      case 'prescriptions':
        return renderPrescriptionsSection();
      case 'triage':
        return renderTriageSection();
      case 'marketplace':
        return renderMarketplaceSection();
      case 'analytics':
        return renderAnalyticsSection();
      case 'profile':
        return renderProfileSection();
      default:
        return renderOverviewSection();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading veterinarian dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-900">Welcome back, Dr. {profile?.full_name || 'Veterinarian'}</h4>
              </div>
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Schedule
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-2 py-2">
            <div className="flex overflow-x-auto space-x-1 pb-2">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-shrink-0 flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1.5">{section.icon}</span>
                  {section.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet.svg" 
                    alt="Veterinarian" 
                    className="w-10 h-10"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-semibold text-gray-900 truncate">Veterinarian</h1>
                    <p className="text-sm text-gray-600 truncate">{profile?.full_name}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigationSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6">
            {renderActiveSection()}
          </div>
        </div>

        {/* Modals */}
        {showAvailabilityModal && (
          <ProviderAvailability
            isOpen={showAvailabilityModal}
            onClose={() => setShowAvailabilityModal(false)}
            providerData={providerData}
          />
        )}
        
        {showCreateServiceModal && (
          <ServiceCreateForm
            onClose={() => setShowCreateServiceModal(false)}
          />
        )}
        
        {showEditServiceModal && editingService && (
          <ServiceEditForm
            service={editingService}
            onClose={() => {
              setShowEditServiceModal(false);
              setEditingService(null);
            }}
          />
        )}
        
        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      description: '',
                      price: '',
                      category: 'Accessories',
                      brand: '',
                      stockQuantity: '',
                      photos: [],
                      specifications: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <UIIcon type="close" className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Premium Dog Food"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Royal Canin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Describe the product, its benefits, and usage instructions..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Accessories">Accessories</option>
                      <option value="Supplements">Supplements</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Photos (up to 4)
                  </label>
                  
                  {/* Photo Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="photo-upload"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={productForm.photos.length >= 4}
                    />
                    <label 
                      htmlFor="photo-upload" 
                      className={`cursor-pointer ${productForm.photos.length >= 4 ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <div className="space-y-2">
                        <UIIcon type="image" className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload photos
                          </span>
                          <span> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                        <p className="text-xs text-gray-500">
                          {productForm.photos.length}/4 photos uploaded
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Photo Preview Grid */}
                  {productForm.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {productForm.photos.map((photo, index) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Product view ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specifications
                  </label>
                  <textarea
                    value={productForm.specifications}
                    onChange={(e) => setProductForm({...productForm, specifications: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Size, weight, ingredients, dosage instructions, etc..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductModal(false);
                      setEditingProduct(null);
                      setProductForm({
                         name: '',
                         description: '',
                         price: '',
                         category: 'Accessories',
                         brand: '',
                         stockQuantity: '',
                         photos: [],
                         specifications: ''
                       });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Package Modal */}
        {showPackageModal && (
          <PackageForm
            isEdit={!!editingPackage}
            initialData={editingPackage || {}}
            onClose={() => {
              setShowPackageModal(false);
              setEditingPackage(null);
            }}
          />
        )}
        
        {/* Pay-Per-Listing Modal */}
        {showPayPerListingModal && payPerListingType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    Add More {payPerListingType === 'service' ? 'Services' : payPerListingType === 'product' ? 'Products' : 'Packages'}
                  </h2>
                  <button 
                    onClick={() => setShowPayPerListingModal(false)} 
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Expand Your {payPerListingType === 'service' ? 'Services' : payPerListingType === 'product' ? 'Products' : 'Packages'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    You have {payPerListingType === 'service' ? 
                      `${getServicesOnly(listings).length}/${FREE_SERVICE_LIMIT} services` :
                      payPerListingType === 'product' ? 
                      `${products.length}/${FREE_PRODUCT_LIMIT} products` :
                      `${packages.length}/${FREE_PACKAGE_LIMIT} packages`
                    }. Add more to grow your business!
                  </p>
                </div>

                {/* Billing Period Toggle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button
                      onClick={() => setBillingPeriod('monthly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingPeriod === 'monthly'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingPeriod('yearly')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingPeriod === 'yearly'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Yearly
                      <span className="ml-1 text-xs text-green-600 font-semibold">SAVE 17%</span>
                    </button>
                  </div>
                </div>

                {/* Pricing Options */}
                <div className="space-y-3 mb-6">
                  {/* Individual Option */}
                  <button 
                    onClick={() => {
                      // TODO: Implement payment processing
                      showSuccess(`Payment integration coming soon! Contact support to add ${billingPeriod} billing for 1 ${payPerListingType} listing.`, 5000);
                      setShowPayPerListingModal(false);
                    }}
                    className="w-full border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          1 {payPerListingType === 'service' ? 'Service' : payPerListingType === 'product' ? 'Product' : 'Package'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                           ${getIndividualPrice(payPerListingType)}
                         </p>
                         <p className="text-xs text-gray-500">
                           ${billingPeriod === 'yearly' ? (getIndividualPrice(payPerListingType) / 12).toFixed(2) + '/month' : getIndividualPrice(payPerListingType) + '/month'}
                           {billingPeriod === 'yearly' && <span className="text-green-600 ml-1">(billed yearly)</span>}
                         </p>
                      </div>
                    </div>
                  </button>

                  {/* 3-Pack Option */}
                  <button 
                    onClick={() => {
                      // TODO: Implement payment processing
                      showSuccess(`Payment integration coming soon! Contact support to add ${billingPeriod} billing for 3 ${payPerListingType} listings.`, 5000);
                      setShowPayPerListingModal(false);
                    }}
                    className="w-full border-2 border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors text-left relative"
                  >
                    <div className="absolute -top-2 left-4">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        POPULAR
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          3 {payPerListingType === 'service' ? 'Services' : payPerListingType === 'product' ? 'Products' : 'Packages'}
                        </p>
                        <p className="text-sm text-green-700">Save money</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                           ${get3PackPrice(payPerListingType)}
                        </p>
                        <p className="text-xs text-green-600">
                           ${billingPeriod === 'yearly' ? (get3PackPrice(payPerListingType) / 12 / 3).toFixed(2) + '/month each' : (get3PackPrice(payPerListingType) / 3).toFixed(2) + '/month each'}
                           {billingPeriod === 'yearly' && <span className="ml-1">(billed yearly)</span>}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* 5-Pack Option */}
                  <button 
                    onClick={() => {
                      // TODO: Implement payment processing
                      showSuccess(`Payment integration coming soon! Contact support to add ${billingPeriod} billing for 5 ${payPerListingType} listings.`, 5000);
                      setShowPayPerListingModal(false);
                    }}
                    className="w-full border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors text-left relative"
                  >
                    <div className="absolute -top-2 left-4">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        BEST VALUE
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          5 {payPerListingType === 'service' ? 'Services' : payPerListingType === 'product' ? 'Products' : 'Packages'}
                        </p>
                        <p className="text-sm text-blue-700">Best value</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                           ${get5PackPrice(payPerListingType)}
                        </p>
                        <p className="text-xs text-blue-600">
                           ${billingPeriod === 'yearly' ? (get5PackPrice(payPerListingType) / 12 / 5).toFixed(2) + '/month each' : (get5PackPrice(payPerListingType) / 5).toFixed(2) + '/month each'}
                           {billingPeriod === 'yearly' && <span className="ml-1">(billed yearly)</span>}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">What you get:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <UIIcon type="check" className="w-4 h-4 text-green-500 mr-2" />
                      Active {payPerListingType === 'service' ? 'service listing' : payPerListingType === 'product' ? 'product listing' : 'service package listing'}{billingPeriod === 'yearly' ? 's' : ''} while subscribed
                    </li>
                    <li className="flex items-center">
                      <UIIcon type="check" className="w-4 h-4 text-green-500 mr-2" />
                      Full marketplace visibility
                    </li>
                    <li className="flex items-center">
                      <UIIcon type="check" className="w-4 h-4 text-green-500 mr-2" />
                      Same commission rates ({payPerListingType === 'service' ? SERVICE_COMMISSION_RATE * 100 : PRODUCT_COMMISSION_RATE * 100}%)
                    </li>
                    <li className="flex items-center">
                      <UIIcon type="check" className="w-4 h-4 text-green-500 mr-2" />
                      {billingPeriod === 'yearly' ? 'Save 17% with yearly billing' : 'Flexible monthly billing'}
                    </li>
                    <li className="flex items-center">
                      <UIIcon type="check" className="w-4 h-4 text-green-500 mr-2" />
                      Cancel anytime
                    </li>
                  </ul>
                </div>

                {/* Cancel Button */}
                <div className="text-center">
                  <button
                    onClick={() => setShowPayPerListingModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors text-sm underline"
                  >
                    Maybe Later
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment processing • {billingPeriod === 'yearly' ? 'Yearly billing (save 17%)' : 'Monthly billing'} • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default VetDashboard;