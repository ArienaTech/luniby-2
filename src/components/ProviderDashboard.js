import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { getUserSafely } from '../lib/supabase-utils.js';
import { useNotificationContext } from '../contexts/NotificationContext';
import QualificationForm from './QualificationForm';
import ProviderAvailability from './ProviderAvailability';
import StatsOverview from './dashboard/StatsOverview';
import MarketplaceSummary from './dashboard/MarketplaceSummary';
import MarketplaceManager from './dashboard/MarketplaceManager';
import CasesSummary from './dashboard/CasesSummary';
import ErrorBoundary from './common/ErrorBoundary';
import * as Sentry from '@sentry/react';
import { PROVIDER_TYPES } from '../constants/providerTypes';
import { getProviderConfig, getProviderLabels, getProviderNavigation, hasFeature } from '../config/providerConfig';
import CaseManager from './vet-nurse/CaseManager';

const ProviderDashboard = () => {
  const { showInfo, showSuccess, showError } = useNotificationContext();
  
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
  const PACKAGE_5_PACK_YEARLY = 99.90;   // 5 packages for $99.90/year ($8.33/month equivalent) // $25/month

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

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [triageCases, setTriageCases] = useState([]);
  const [products, setProducts] = useState([]);
  const [qualificationSubmission, setQualificationSubmission] = useState(null);
  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);

  const [showPayPerListingModal, setShowPayPerListingModal] = useState(false);
  const [payPerListingType, setPayPerListingType] = useState(null); // 'service', 'product', or 'package'
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [editingService, setEditingService] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  
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

  const [stats, setStats] = useState({
    totalListings: 0,
    activeBookings: 0,
    totalBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    triageCasesHandled: 0,
    clientsHelped: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dynamic provider labels based on provider type
  // Use centralized provider configuration
  const getProviderLabelsLocal = (providerType) => {
    return getProviderLabels(providerType);
  };

  // Get current provider labels
  const providerLabels = getProviderLabelsLocal(providerData?.provider_type);

  // Migration function for localStorage packages to Supabase
  const migrateLocalPackagesToSupabase = async (userId, localPackages) => {
    try {
      console.log('Migrating packages to Supabase...', localPackages);
      
      // Convert localStorage packages to Supabase format
      const packagesToMigrate = localPackages.map(pkg => ({
        provider_id: userId,
        name: pkg.name,
        description: pkg.description,
        service_ids: pkg.service_ids || [],
        original_price: pkg.original_price || 0,
        package_price: pkg.package_price || 0,
        savings: pkg.savings || 0,
        is_active: pkg.is_active !== undefined ? pkg.is_active : true
      }));

      // Insert packages into Supabase
      const { data, error } = await supabase
        .from('packages')
        .insert(packagesToMigrate)
        .select();

      if (error) {
        console.error('Migration error:', error);
        throw error;
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`packages_${userId}`);
      
      // Update local state with migrated packages
      setPackages(data || []);
      
      showSuccess(`Successfully migrated ${localPackages.length} packages to Supabase!`, 5000);
      console.log('Migration successful:', data);
      
    } catch (error) {
      console.error('Failed to migrate packages:', error);
      showError('Failed to migrate packages to database. Using local storage for now.');
    }
  };

  // Experience level categorization
  const getExperienceLevel = (years, providerType) => {
    // Note: Luniby only hires veterinarians with at least 1 year experience
    if (!years || years === 0) return { level: 'Vet Professional', color: 'blue', description: 'Qualified professional' };
    
    if (providerType === 'veterinarian') {
      if (years <= 3) return { level: 'Veterinarian', color: 'blue', description: 'Qualified veterinarian' };
      if (years <= 7) return { level: 'Experienced Veterinarian', color: 'green', description: 'Experienced professional' };
      if (years <= 12) return { level: 'Senior Veterinarian', color: 'purple', description: 'Highly experienced' };
      return { level: 'Expert Veterinarian', color: 'gold', description: 'Expert level' };
    } else {
      // Veterinarian levels (minimum 1 year for Luniby hiring)
      if (years <= 3) return { level: 'Veterinarian', color: 'blue', description: 'Qualified veterinarian' };
      if (years <= 7) return { level: 'Experienced Veterinarian', color: 'green', description: 'Experienced professional' };
      if (years <= 12) return { level: 'Senior Veterinarian', color: 'purple', description: 'Highly experienced' };
      return { level: 'Expert Veterinarian', color: 'gold', description: 'Expert level' };
    }
  };

  // Role-based service options
  const getServiceOptions = (providerType) => {
    const baseServices = [
      { value: "Mobile Consultation", label: "Mobile Consultation" },
      { value: "Mobile Emergency Care", label: "Mobile Emergency Care" }
    ];
    
    if (providerType === 'veterinarian') {
      return [
        ...baseServices,
        { value: "Clinic Consultation", label: "Clinic Consultation" },
        { value: "Surgery Services", label: "Surgery Services" },
        { value: "Diagnostic Testing", label: "Diagnostic Testing" },
        { value: "Preventive Care", label: "Preventive Care" },
        { value: "Dental Care", label: "Dental Care" },
        { value: "Orthopedic Care", label: "Orthopedic Care" },
        { value: "Laboratory Services", label: "Laboratory Services" },
        { value: "Telemedicine Consultation", label: "Telemedicine Consultation" }
      ];
    }
    
    return [
      ...baseServices,
      { value: "Mobile Health Check", label: "Mobile Health Check" },
      { value: "Mobile Vaccination", label: "Mobile Vaccination" },
      { value: "Mobile Nail Trimming", label: "Mobile Nail Trimming" },
      { value: "Mobile Grooming", label: "Mobile Grooming" },
      { value: "LuniTriage SOAP Review", label: "LuniTriage SOAP Review" },
      { value: "LuniTriage Consultation", label: "LuniTriage Consultation" }
    ];
    };

  // Dynamic navigation sections based on provider type
  // Use centralized navigation configuration
  const getNavigationSectionsLocal = (providerType) => {
    return getProviderNavigation(providerType);
  };

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  // Reload products when navigating to marketplace section
  useEffect(() => {
    if (activeSection === 'marketplace') {
      // Always check and reload products when entering marketplace to ensure fresh data
      const lastReload = localStorage.getItem('lastProductsReload');
      const now = Date.now();
      
      // Products are now loaded from marketplace_listings in checkUserAndLoadData
      // No need for separate product loading
    }
  }, [activeSection]);

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

  // Check and create products table if needed
  const ensureProductsTable = async () => {
    try {
      // First, try to query the products table to see if it exists
      const { error: tableCheckError } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        alert('Products table needs to be created. Please check the console for SQL to run in Supabase.');
        
        // Provide SQL to create the table
        const createTableSQL = `
-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  specifications TEXT,
  image_url TEXT,
  photos_data JSONB,
  provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  sku VARCHAR(100),
  weight_kg DECIMAL(8,3),
  dimensions VARCHAR(100),
  age_group VARCHAR(50),
  pet_type VARCHAR(50),
  is_prescription BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_products_provider_id ON products(provider_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can manage their own products" ON products
  FOR ALL USING (provider_id IN (
    SELECT id FROM providers WHERE email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);
        `;
        
        return false;
      } else {
        
        // Try to get a sample record to see what columns are available
        const { data: sampleProduct } = await supabase
          .from('products')
          .select('*')
          .limit(1);
        
        if (sampleProduct && sampleProduct.length > 0) {
          // Products table has data, continue normally
        } else {
          // Try to insert a test record to see what constraints exist
          const testCategories = ['food', 'treats', 'toys', 'accessories', 'health', 'grooming', 'medication', 'supplements', 'supplies', 'other'];
          for (const category of testCategories) {
            const { error: testError } = await supabase
              .from('products')
              .insert([{
                name: 'TEST_PRODUCT_DELETE_ME',
                description: 'Test product',
                price: 1.00,
                category: category,
                provider_id: 1,
                is_active: false
              }]);
            
            if (!testError) {
              // Delete the test record
              await supabase
                .from('products')
                .delete()
                .eq('name', 'TEST_PRODUCT_DELETE_ME');
              break;
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // Product management functions
  const handleAddProduct = async () => {
    const tableExists = await ensureProductsTable();
    if (!tableExists) {
      return;
    }

    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stockQuantity) {
      alert('Please fill in all required fields (name, price, category, stock quantity)');
      return;
    }

    // Validate price
    const price = parseFloat(productForm.price);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    // Validate stock quantity
    const stock = parseInt(productForm.stockQuantity);
    if (isNaN(stock) || stock < 0) {
      alert('Please enter a valid stock quantity (0 or greater)');
      return;
    }

    const photoDataSize = JSON.stringify(productForm.photos).length;
    if (photoDataSize > 2000000) {
      alert('Photos are too large. Please use smaller images or reduce the number of photos.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check free tier limits (15 products for free users)
      const currentProductCount = products.length;
      const currentProviderData = providerData || profile || {};
      // Default to free tier if no subscription plan is set
      const subscriptionPlan = currentProviderData?.subscription_plan;
      const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';

      console.log('Product creation limit check:', {
        currentProductCount,
        FREE_PRODUCT_LIMIT,
        isFreeTier,
        editingProduct: !!editingProduct,
        subscription_plan: currentProviderData?.subscription_plan
      });

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
        provider_type: profile?.provider_type || providerData?.provider_type || 'Veterinarian',
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

        if (error) {
          if (error.message.includes('check constraint') && error.message.includes('category')) {
            const { data: existingProducts } = await supabase
              .from('products')
              .select('category')
              .limit(50);
            
            if (existingProducts && existingProducts.length > 0) {
              const uniqueCategories = [...new Set(existingProducts.map(p => p.category))];
              alert(`Category constraint error. Allowed categories appear to be: ${uniqueCategories.join(', ')}`);
            } else {
              alert('Category constraint error. Please check the console and try a different category.');
            }
          }
          throw error;
        }
        savedProduct = data;
      }

      // Check if product appears in marketplace_listings view
      const { data: marketplaceCheck } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('listing_type', 'product')
        .eq('listing_id', savedProduct.listing_id || savedProduct.id);

      if (!marketplaceCheck || marketplaceCheck.length === 0) {
        alert('Product saved but may not appear in public marketplace. The view might need to be updated.');
      }

      // Update local products state with the saved product
      const newProduct = {
        id: savedProduct.id,
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
      
      // Try to save to localStorage with error handling (for offline access)
      try {
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts));
      } catch (storageError) {
        // Don't throw error for localStorage issues since data is saved to database
      }

      // Refresh data to show updated product
      checkUserAndLoadData();

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

    } catch (error) {
      // Check if it's a localStorage size issue
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert('Error: Product photos are too large. Please use smaller images or reduce the number of photos.');
      } else if (error.message.includes('JSON')) {
        alert('Error: Invalid product data. Please check your inputs and try again.');
      } else {
        alert(`Error saving product: ${error.message}. Please try again.`);
      }
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete from marketplace_listings instead of products table
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('listing_id', productId)
        .eq('provider_email', user.email)
        .eq('listing_type', 'product');

      if (error) throw error;

      // Update local state
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      
      // Update localStorage
      try {
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts));
      } catch (storageError) {
        // Don't throw error for localStorage issues
      }

      // Also remove from local listings state
      const updatedListings = listings.filter(listing => listing.id !== `product_${productId}`);
      setListings(updatedListings);

    } catch (error) {
      alert(`Error deleting product: ${error.message}. Please try again.`);
    }
  };

  // Photo handling functions
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxFiles = 4;
    
    if (productForm.photos.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} photos`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Check file size (10MB limit per file)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Please use images under 10MB.`);
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
        alert('Please select only image files');
      }
    });
  };

  const removePhoto = (photoId) => {
    setProductForm(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };



  const checkUserAndLoadData = async () => {
    try {
      const user = await getUserSafely();
      if (!user) {
        navigate('/signin');
        return;
      }

      // Set user state
      setUser(user);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();



      if (!profileData || profileData.role !== 'provider') {
        navigate('/');
        return;
      }

      setProfile(profileData);

      // Get provider data
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', user.id)
        .single();



      setProviderData(provider);

      // Populate profile form with existing data
      
      // Prioritize updated profile data over provider name
      const fullName = profileData?.full_name || provider?.name || user?.email?.split('@')[0] || 'Unknown User';
      
      const formData = {
        fullName: fullName,
        phone: provider?.phone || '',
        address: provider?.address || '',
        description: provider?.description || '',
        serviceAreas: provider?.service_areas || 'Auckland',
        maxTravelDistance: provider?.max_travel_distance || '25',
        yearsOfExperience: provider?.years_experience || '',
        profilePicture: provider?.profile_picture || profileData?.avatar_url || ''
              };
        
        setProfileForm(formData);

      // Check if qualifications have been submitted
      const { data: qualificationData } = await supabase
        .from('provider_qualifications')
        .select('*')
        .eq('provider_id', user.id)
        .single();

      setQualificationSubmission(qualificationData);

      // Load provider's listings from marketplace_listings (revert to working solution)
      const { data: listingsData } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('provider_email', profileData.email)
        .order('created_at', { ascending: false });

      setListings(listingsData || []);

      // Load packages from marketplace_listings (not separate packages table)
      const packagesFromMarketplace = (listingsData || []).filter(listing => 
        listing.listing_type === 'package' || 
        listing.service_types === 'package' ||
        (typeof listing.service_types === 'string' && listing.service_types.toLowerCase().includes('package'))
      ).map(listing => ({
        id: listing.listing_id,
        name: listing.name,
        description: listing.description,
        service_ids: [], // Could be parsed from description or stored differently
        original_price: listing.price * 1.2, // Assume 20% discount for display
        package_price: listing.price,
        savings: listing.price * 0.2, // 20% savings
        is_active: listing.active !== false,
        provider_id: listing.provider_id,
        created_at: listing.created_at,
        updated_at: listing.updated_at
      }));
      
      setPackages(packagesFromMarketplace);

      // Load products from marketplace_listings (not separate products table)
      const productsFromMarketplace = (listingsData || []).filter(listing => 
        listing.listing_type === 'product' || listing.service_types === 'product'
      ).map(listing => ({
        id: listing.listing_id,
        name: listing.name,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        brand: listing.brand,
        stockQuantity: listing.stock_quantity,
        photos: listing.image_url ? [{ id: 1, url: listing.image_url, name: 'Product Image' }] : [],
        specifications: '',
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
        type: 'product'
      }));
      
      setProducts(productsFromMarketplace);

      // Load bookings for this provider
      const { data: bookingsData } = await supabase
        .from('consultation_bookings')
        .select(`
          *,
          marketplace_listings (
            name,
            service_types
          )
        `)
        .in('listing_id', (listingsData || []).map(l => l.listing_id))
        .order('created_at', { ascending: false })
        .limit(20);

      setBookings(bookingsData || []);

      // Load triage cases (for verified providers only)
      let triageData = [];
      if (provider?.verified) {
        // Filter bookings for LuniTriage services
        triageData = (bookingsData || []).filter(booking => {
          const serviceType = booking.marketplace_listings?.service_types || booking.consultation_type;
          return serviceType === 'LuniTriage SOAP Review' || serviceType === 'LuniTriage Consultation';
        });
        setTriageCases(triageData);
      } else {
        // No triage cases to show in demo mode
        setTriageCases([]);
      }

      // Calculate stats
      const activeBookings = (bookingsData || []).filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      ).length;

      // Check if provider is published (has record in providers table)
      const { data: publishedProvider } = await supabase
        .from('providers')
        .select('id, verified')
        .eq('id', user.id)
        .single();

      // Provider record will be created when first service is submitted

      // Update provider data with published info
      if (publishedProvider && providerData) {
        setProviderData({
          ...providerData,
          verified: publishedProvider.verified
        });
      }

      const averageRating = (listingsData || []).reduce((sum, listing) => 
        sum + (listing.rating || 0), 0
      ) / Math.max((listingsData || []).length, 1);

      setStats({
        totalListings: (listingsData || []).length,
        activeBookings,
        totalBookings: (bookingsData || []).length,
        totalEarnings: 0, // This would come from a payments table
        averageRating: Math.round(averageRating * 10) / 10,
        triageCasesHandled: provider?.verified ? triageData.length : 0,
        clientsHelped: (bookingsData || []).filter(b => b.status === 'completed').length
      });

    } catch (error) {
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

    const handleQualificationSubmissionComplete = useCallback((submission) => {
    setQualificationSubmission(submission);
  }, []);

  // Add missing click handlers for dashboard buttons
  const handleAddNewService = () => {
    // Check limits before opening modal
    const currentProviderData = providerData || profile || {};
    const currentServiceCount = getServicesOnly(listings).length;
    const subscriptionPlan = currentProviderData?.subscription_plan;
    const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';
    
    console.log('Add New Service button limit check:', {
      currentServiceCount,
      FREE_SERVICE_LIMIT,
      isFreeTier,
      subscriptionPlan
    });
    
    if (isFreeTier && currentServiceCount >= FREE_SERVICE_LIMIT) {
      setPayPerListingType('service');
      setShowPayPerListingModal(true);
      return;
    }
    
    // Open service creation modal
    setShowCreateServiceModal(true);
  };

  const handleAddNewPackage = () => {
    // Check limits before opening modal
    const currentProviderData = providerData || profile || {};
    const currentPackageCount = packages.length;
    const subscriptionPlan = currentProviderData?.subscription_plan;
    const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';
    
    console.log('Add New Package button limit check:', {
      currentPackageCount,
      FREE_PACKAGE_LIMIT,
      isFreeTier,
      subscriptionPlan
    });
    
    if (isFreeTier && currentPackageCount >= FREE_PACKAGE_LIMIT) {
      setPayPerListingType('package');
      setShowPayPerListingModal(true);
      return;
    }
    
    // Open package creation modal
    setShowPackageModal(true);
  };

  const handleEditListing = (listing) => {
    // Open edit modal with listing data instead of navigating
    setEditingService(listing);
    setShowEditServiceModal(true);
  };

  const handleToggleListingStatus = async (listingId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ active: !currentStatus })
        .eq('listing_id', listingId);

      if (error) throw error;

      // Refresh listings
      checkUserAndLoadData();
      showSuccess(!currentStatus ? 'Service activated successfully' : 'Service deactivated successfully', 4000);
    } catch (error) {
      // Error updating listing status
              showError('Failed to update service status');
    }
  };

  const handleViewSchedule = () => {
    // Show schedule modal instead of navigating
    setShowScheduleModal(true);
  };

  const handleViewMessages = () => {
    // Show messages modal instead of navigating
    setShowMessagesModal(true);
  };

  const handleViewAnalytics = () => {
    // Show analytics modal instead of navigating
    setShowAnalyticsModal(true);
  };

  const handleManageAvailability = () => {
    // Show availability modal instead of navigating
    setShowAvailabilityModal(true);
  };

  // Go Live function - publishes provider profile to marketplace
  const handleGoLive = async () => {
    try {
      const user = await getUserSafely();
      if (!user) {
        showInfo('User not authenticated', 'error');
        return;
      }

      // Check if provider record exists
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id, verified')
        .eq('id', user.id)
        .single();

      if (existingProvider) {
        // Update existing provider to be verified/live
        const { error: updateError } = await supabase
          .from('providers')
          .update({ verified: true, is_active: true })
          .eq('id', user.id);

        if (updateError) throw updateError;
        
        showSuccess('🎉 Your profile is now live on the marketplace! You can view it using "View My Listing".', 5000);
      } else {
        // Create new provider record
        const providerData = profile || {};
        const newProviderData = {
          id: user.id,
          name: providerData?.full_name || user.email,
          email: user.email,
          phone: providerData?.phone || null,
          provider_type: providerData?.provider_type || 'vet_nurse',
          business_name: providerData?.business_name || null,
          address: null,
          city: 'Location TBD',
          country: 'Australia',
          bio: 'Professional veterinary nurse providing quality care for your pets. Experienced in various treatments and dedicated to animal welfare.',
          offers_services: true,
          offers_products: false,
          verified: true, // Live on marketplace
          is_active: true,
          featured: false,
          rating: 0.00,
          reviews_count: 0,
          profile_image_url: null,
          service_types: ['Veterinary Nursing']
        };

        const { error: insertError } = await supabase.from('providers').insert(newProviderData);
        if (insertError) throw insertError;

        showSuccess('🎉 Your profile is now live on the marketplace! You can view it using "View My Listing".', 5000);
      }

      // Update all services to be verified/active
      const { error: servicesError } = await supabase
        .from('marketplace_listings')
        .update({ verified: true, active: true })
        .eq('provider_email', user.email);

      if (servicesError) {
        // Error updating services
      }

      // Reload data to reflect changes
      checkUserAndLoadData();
      
    } catch (error) {
      // Error going live
      showInfo('Failed to go live: ' + error.message, 'error');
    }
  };

  // Service creation handler
  const handleCreateService = async (serviceData) => {
    try {
      
      const user = await getUserSafely();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get provider data first
      const currentProviderData = providerData || profile || {};
      
      // Check free tier limits (5 services for free users)
      const currentServiceCount = getServicesOnly(listings).length;
      // Default to free tier if no subscription plan is set
      const subscriptionPlan = currentProviderData?.subscription_plan;
      const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';

              console.log('Service creation limit check:', {
          currentServiceCount,
          FREE_SERVICE_LIMIT,
          isFreeTier,
          subscriptionPlan,
          providerData: !!currentProviderData
        });

              if (isFreeTier && currentServiceCount >= FREE_SERVICE_LIMIT) {
          showError(`Free tier limit reached! You can have up to ${FREE_SERVICE_LIMIT} services. Click "Upgrade to Premium" to get unlimited services.`);
          return;
        }
      
              const insertData = {
        title: serviceData.title,
        description: serviceData.description,
        service_type: serviceData.service_type,
        location: serviceData.location || 'Location TBD',
        price_from: parseFloat(serviceData.price),
        price_to: parseFloat(serviceData.price),
        provider_name: currentProviderData?.full_name || user.email,
        provider_type: currentProviderData?.role || 'vet_nurse',
        provider_email: user.email,
        provider_phone: currentProviderData?.phone || 'N/A',
        active: true,
        verified: false,
        rating: 0.0,
        reviews_count: 0
      };



      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(insertData)
        .select();
        
      // Services created successfully - ready to go live!

      if (error) {
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      showSuccess('Service created successfully!', 4000);
      setShowCreateServiceModal(false);
      checkUserAndLoadData(); // Refresh data
    } catch (error) {
      showInfo(`Failed to create service: ${error.message}`, 'error');
    }
  };

  // Service editing handler
  const handleDeletePackage = async (packageId, packageName) => {
    if (!window.confirm(`Are you sure you want to delete "${packageName}" package? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete from Supabase
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId)
        .eq('provider_id', user.id);

      if (error) throw error;

      // Update local state
      const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
      setPackages(updatedPackages);

      showSuccess('Package deleted successfully!', 4000);
      
    } catch (error) {
              showError(`Failed to delete package: ${error.message}`);
    }
  };

  const handleDeleteService = async (serviceId, serviceTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Debug: Check what ID we're trying to delete
      console.log('Attempting to delete service with ID:', serviceId);
      
      // First, verify the service exists and belongs to the user
      const { data: existingService, error: checkError } = await supabase
        .from('marketplace_listings')
        .select('listing_id, name, provider_email')
        .eq('listing_id', serviceId)
        .eq('provider_email', user.email);

      if (checkError) throw checkError;

      if (!existingService || existingService.length === 0) {
        // Service not found, let's refresh the data and show current listings
        console.log('Service not found, refreshing data...');
        checkUserAndLoadData();
        throw new Error(`Service not found. The listing may have been already deleted or the page data is outdated. Please refresh and try again.`);
      }

      // Now delete the service
      const { data, error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('listing_id', serviceId)
        .eq('provider_email', user.email)  // Extra security
        .select();

      if (error) throw error;

      // Check if anything was actually deleted
      if (!data || data.length === 0) {
        throw new Error(`Service not found or you don't have permission to delete it (ID: ${serviceId})`);
      }

      // Immediately update local state
      const updatedListings = listings.filter(listing => listing.listing_id !== serviceId);
      setListings(updatedListings);

      // Update stats immediately
      setStats(prevStats => ({
        ...prevStats,
        totalListings: updatedListings.length
      }));

      showSuccess('Service deleted successfully!', 4000);
      
      // Refresh bookings and other dependent data (but not listings since we already updated them)
      try {
        const { data: bookingsData } = await supabase
          .from('consultation_bookings')
          .select(`
            *,
            marketplace_listings (
              name,
              service_types
            )
          `)
                                             .in('listing_id', updatedListings.map(l => l.listing_id))
          .order('created_at', { ascending: false })
          .limit(20);

        setBookings(bookingsData || []);
      } catch (bookingError) {
        // Don't fail the whole operation if booking refresh fails
        console.warn('Failed to refresh bookings after service deletion:', bookingError);
      }
      
    } catch (error) {
      console.error('Delete service error:', error);
      showError(`Failed to delete service: ${error.message}`);
      
      // If it's a "not found" error, refresh the data to show current state
      if (error.message.includes('not found') || error.message.includes('outdated')) {
        setTimeout(() => {
          checkUserAndLoadData();
        }, 2000);
      }
    }
  };

  const handleUpdateService = async (serviceData) => {
    try {
      
      const updateData = {
        title: serviceData.title,
        description: serviceData.description,
        service_type: serviceData.service_type,
        location: serviceData.location || 'Location TBD',
        price_from: parseFloat(serviceData.price),
        price_to: parseFloat(serviceData.price),
        updated_at: new Date().toISOString()
      };
      

      
      const { error } = await supabase
        .from('marketplace_listings')
        .update(updateData)
        .eq('listing_id', editingService.listing_id || editingService.id);

      if (error) {
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      showSuccess('Service updated successfully!', 4000);
      setShowEditServiceModal(false);
      setEditingService(null);
      checkUserAndLoadData(); // Refresh data
    } catch (error) {
      showInfo(`Failed to update service: ${error.message}`, 'error');
    }
  };

  



  // View live listing
  const handleViewListing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const listingUrl = `/provider/${user.id}`;
        window.open(listingUrl, '_blank');
      } else {
        showInfo('Please log in to view your listing', 'error');
      }
    } catch (error) {
      showInfo('Unable to open your listing. Please try again.', 'error');
    }
  };



  // Service edit component
  const ServiceEditForm = ({ service, onClose }) => {
    const [serviceData, setServiceData] = useState({
      title: service.name || service.title || '',
      description: service.description || '',
      price_from: service.price || service.price_from || '',
      service_type: service.service_types || service.service_type || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');



        const { data, error } = await supabase
          .from('marketplace_listings')
          .update({
            name: serviceData.title,
            description: serviceData.description,
            price: parseFloat(serviceData.price_from),
            service_types: serviceData.service_type,
            updated_at: new Date().toISOString()
          })
          .eq('listing_id', service.listing_id || service.id)
          .select();

        if (error) throw error;


        showSuccess('Service updated successfully!', 4000);
        onClose();
        checkUserAndLoadData(); // Refresh data
        
              } catch (error) {
          showInfo(`Failed to update service: ${error.message}`, 'error');
        }
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
                placeholder="e.g., Mobile Health Check"
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
                {getServiceOptions(providerData?.provider_type).map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
                {serviceData.service_type?.includes('LuniTriage') && (
                  <span className="text-sm text-blue-600 ml-2">(Fixed pricing)</span>
                )}
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={serviceData.price_from}
                onChange={(e) => setServiceData({...serviceData, price_from: e.target.value})}
                disabled={serviceData.service_type?.includes('LuniTriage')}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  serviceData.service_type?.includes('LuniTriage') ? 'bg-gray-100' : ''
                }`}
                placeholder="50.00"
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Service
              </button>
            </div>
          </form>
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
        showInfo('Please select at least 2 services for a package', 'error');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check free tier limits (3 packages for free users)
        const currentPackageCount = packages.length;
        const currentProviderData = providerData || profile || {};
        // Default to free tier if no subscription plan is set
        const subscriptionPlan = currentProviderData?.subscription_plan;
        const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';

        console.log('Package creation limit check:', {
          currentPackageCount,
          FREE_PACKAGE_LIMIT,
          isFreeTier,
          isEdit,
          subscription_plan: currentProviderData?.subscription_plan
        });

        // Note: For new packages, limit check is now done before opening modal (handleAddNewPackage)
        // This check is kept only for edge cases or if someone bypasses the button handler

        const packageInfo = {
          listing_type: 'package',
          listing_id: isEdit ? initialData.id : window.crypto?.randomUUID?.() || Math.random().toString(36),
          name: packageData.name,
          description: packageData.description,
          price: parseFloat(packageData.packagePrice),
          service_types: 'package',
          provider_email: user.email,
          provider_name: profile?.full_name || providerData?.name || user.email?.split('@')[0],
          provider_type: profile?.provider_type || providerData?.provider_type || 'Veterinarian',
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
            .eq('provider_email', user.email)
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
        checkUserAndLoadData();

        showSuccess(`Package ${isEdit ? 'updated' : 'created'} successfully!`, 4000);
        onClose();
        
      } catch (error) {
        showInfo('Failed to save package', 'error');
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
                  placeholder="e.g., Wellness Package"
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
                  placeholder="120.00"
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
                placeholder="Describe what's included in this package..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Select Services *</label>
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEdit ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Quick service cards component
  const QuickServiceCards = ({ onClose }) => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [customPrices, setCustomPrices] = useState({});

    // Role-based available services
    const getAvailableServices = (providerType) => {
      const baseServices = [
        {
          id: 'consultation',
          title: 'Mobile Consultation',
          description: 'Professional consultation at your location',
          defaultPrice: providerType === 'veterinarian' ? 120.00 : 75.00,
          category: 'Mobile Consultation',
          icon: '🩺',
          preset: false
        },
        {
          id: 'emergency',
          title: 'Mobile Emergency Care',
          description: 'Emergency care service at your location',
          defaultPrice: providerType === 'veterinarian' ? 200.00 : 150.00,
          category: 'Mobile Emergency Care',
          icon: '🚨',
          preset: false
        }
      ];

      if (providerType === 'veterinarian') {
        return [
          ...baseServices,
          {
            id: 'clinicConsult',
            title: 'Clinic Consultation',
            description: 'In-clinic veterinary consultation',
            defaultPrice: 80.00,
            category: 'Clinic Consultation',
            icon: '🏥',
            preset: false
          },
          {
            id: 'surgery',
            title: 'Surgery Services',
            description: 'Surgical procedures and operations',
            defaultPrice: 300.00,
            category: 'Surgery Services',
            icon: '⚕️',
            preset: false
          },
          {
            id: 'diagnostic',
            title: 'Diagnostic Testing',
            description: 'Laboratory tests and diagnostic procedures',
            defaultPrice: 150.00,
            category: 'Diagnostic Testing',
            icon: '🔬',
            preset: false
          },
          {
            id: 'preventive',
            title: 'Preventive Care',
            description: 'Wellness exams and preventive treatments',
            defaultPrice: 100.00,
            category: 'Preventive Care',
            icon: '🛡️',
            preset: false
          }
        ];
      }

      return [
        ...baseServices,
        {
          id: 'lunisoap',
          title: 'LuniTriage SOAP Review',
          description: 'Professional assessment of SOAP notes within 2 hours',
          defaultPrice: 4.99,
          category: 'LuniTriage SOAP Review',
          icon: '📋',
          preset: true
        },
        {
          id: 'luniconsult', 
          title: 'LuniTriage Consultation',
          description: '15-minute consultation to assess if vet visit needed',
          defaultPrice: 14.99,
          category: 'LuniTriage Consultation', 
          icon: '💬',
          preset: true
        },
        {
          id: 'nailtrim',
          title: 'Mobile Nail Trimming',
          description: 'Professional nail trimming service at your location',
          defaultPrice: 50.00,
          category: 'Mobile Nail Trimming',
          icon: '✂️',
          preset: false
        },
        {
          id: 'healthcheck',
          title: 'Mobile Health Check',
          description: 'Comprehensive health assessment at your home',
          defaultPrice: 75.00,
          category: 'Mobile Health Check',
          icon: '🏥',
          preset: false
        },
        {
          id: 'vaccination',
          title: 'Mobile Vaccination',
          description: 'Vaccination service at your location',
          defaultPrice: 60.00,
          category: 'Mobile Vaccination',
          icon: '💉',
          preset: false
        }
      ];
    };

    const availableServices = getAvailableServices(providerData?.provider_type);

    const handleServiceToggle = (service) => {
      if (selectedServices.find(s => s.id === service.id)) {
        setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        const newPrices = { ...customPrices };
        delete newPrices[service.id];
        setCustomPrices(newPrices);
      } else {
        setSelectedServices([...selectedServices, service]);
        setCustomPrices({
          ...customPrices,
          [service.id]: service.defaultPrice
        });
      }
    };

    const handlePriceChange = (serviceId, price) => {
      setCustomPrices({
        ...customPrices,
        [serviceId]: parseFloat(price) || 0
      });
    };

    const handleSubmitServices = async () => {
      if (selectedServices.length === 0) {
        showInfo('Please select at least one service', 'error');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check free tier limits BEFORE creating services
        const currentProviderData = providerData || profile || {};
        const currentServiceCount = getServicesOnly(listings).length;
        const subscriptionPlan = currentProviderData?.subscription_plan;
        const isFreeTier = !subscriptionPlan || subscriptionPlan === 'free' || subscriptionPlan !== 'premium';
        
        console.log('Bulk service creation limit check:', {
          currentServiceCount,
          selectedServicesCount: selectedServices.length,
          totalAfterCreation: currentServiceCount + selectedServices.length,
          FREE_SERVICE_LIMIT,
          isFreeTier,
          subscriptionPlan
        });

        if (isFreeTier && (currentServiceCount + selectedServices.length) > FREE_SERVICE_LIMIT) {
          setPayPerListingType('service');
          setShowPayPerListingModal(true);
          return;
        }

        const currentProviderDataForInsert = profile || {};
        
        // Create all selected services
        const servicePromises = selectedServices.map(service => {
          const insertData = {
            listing_type: 'service',
            listing_id: window.crypto?.randomUUID?.() || Math.random().toString(36),
            name: service.title,
            description: service.description,
            service_types: service.category,
            price: customPrices[service.id] || service.defaultPrice,
            provider_name: currentProviderDataForInsert?.full_name || user.email,
            provider_type: currentProviderDataForInsert?.provider_type || 'vet_nurse',
            provider_email: user.email,
            provider_phone: currentProviderDataForInsert?.phone || 'N/A',
            active: true,
            verified: false, // Will be set to true when going live
            rating: 0.0,
            reviews_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          return supabase.from('marketplace_listings').insert(insertData).select();
        });

        const results = await Promise.all(servicePromises);
        const errors = results.filter(r => r.error);
        
        if (errors.length > 0) {
          throw new Error(`Failed to create ${errors.length} services`);
        }

        showSuccess(`✅ ${selectedServices.length} services created! Ready to go live.`, 4000);
        onClose();
        checkUserAndLoadData(); // Reload data
        
      } catch (error) {
        showInfo('Failed to create services: ' + error.message, 'error');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add Services</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mt-2">Select services you want to offer and set your prices</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {availableServices.map(service => {
                const isSelected = selectedServices.find(s => s.id === service.id);
                const currentPrice = customPrices[service.id] || service.defaultPrice;
                
                return (
                  <div 
                    key={service.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{service.icon}</span>
                          <h3 className="font-semibold text-gray-900">{service.title}</h3>
                          {service.preset && (
                            <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              LuniTriage
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        
                        {isSelected && (
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Price:</label>
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-1">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={currentPrice}
                                onChange={(e) => handlePriceChange(service.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm ${
                                  service.preset ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                                disabled={service.preset}
                              />
                            </div>
                            {service.preset && (
                              <span className="text-xs text-gray-500">Fixed price</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="text-white text-sm">✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitServices}
                disabled={selectedServices.length === 0}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium ${
                  selectedServices.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-[#E5F4F1] text-[#4A9A64]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Sidebar navigation items
  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showInfo('User not authenticated', 'error');
        return;
      }

      // Update providers table (note: name/full_name and years_experience are not updated as they are verified)
      // Only update fields that are commonly available in the providers table
      const updateData = {};
      
      if (profileForm.phone) updateData.phone = profileForm.phone;
      if (profileForm.address) updateData.address = profileForm.address;
      if (profileForm.description) updateData.description = profileForm.description;
      
      // Try to update additional fields that might exist
      if (profileForm.serviceAreas) updateData.service_areas = profileForm.serviceAreas;
      if (profileForm.maxTravelDistance) updateData.max_travel_distance = profileForm.maxTravelDistance;
      if (profileForm.profilePicture) updateData.profile_picture = profileForm.profilePicture;
      
      // First check if provider record exists
      const { data: existingProvider, error: checkError } = await supabase
        .from('providers')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (checkError || !existingProvider) {
        showInfo('Provider record not found. Please complete your provider registration first.', 'error');
        return;
      }
      
      const { error: providerError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('id', user.id);

      if (providerError) {
        // If the error is due to missing columns, try with just the basic fields
        if (providerError.message && providerError.message.includes('column')) {
          const basicUpdateData = {};
          if (profileForm.phone) basicUpdateData.phone = profileForm.phone;
          if (profileForm.address) basicUpdateData.address = profileForm.address;
          if (profileForm.description) basicUpdateData.description = profileForm.description;
          
          const { error: basicProviderError } = await supabase
            .from('providers')
            .update(basicUpdateData)
            .eq('id', user.id);
            
          if (basicProviderError) {
            showInfo(`Failed to update provider information: ${basicProviderError.message}`, 'error');
            return;
          }
        } else {
          showInfo(`Failed to update provider information: ${providerError.message}`, 'error');
          return;
        }
      }

      // Also update the profiles table for user profile data
      const profileUpdateData = {};
      if (profileForm.fullName) profileUpdateData.full_name = profileForm.fullName;
      if (profileForm.phone) profileUpdateData.phone = profileForm.phone;
      
      if (Object.keys(profileUpdateData).length > 0) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', user.id);
          
        if (profileUpdateError) {
          showInfo(`Warning: Provider updated but profile update failed: ${profileUpdateError.message}`, 'warning');
        }
      }

      // Small delay to ensure database writes are committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reset form initialization flag so it can be repopulated with fresh data
      setFormInitialized(false);
      
      // Refresh data
      await checkUserAndLoadData();
      
      showSuccess('Profile updated successfully!', 4000);

    } catch (error) {
      showInfo('Failed to save profile changes', 'error');
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showInfo('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showInfo('Image must be smaller than 5MB', 'error');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showInfo('User not authenticated', 'error');
        return;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-profile.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true // Replace if exists
        });

      if (error) {
        // Upload error occurred
        showInfo('Failed to upload image', 'error');
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update the form state
      setProfileForm(prev => ({ ...prev, profilePicture: publicUrl }));
      
      showInfo('Profile picture uploaded successfully!', 'success');

    } catch (error) {
      // Error uploading profile picture
      showInfo('Failed to upload profile picture', 'error');
    }
  };

  // Get dynamic sidebar items based on provider type
  const sidebarItems = getNavigationSectionsLocal(providerData?.provider_type);

  // Render functions for veterinarian-specific sections
  const renderPatientsSection = () => (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Patient Records</h3>
          <p className="text-sm text-gray-600">Manage patient information and medical history</p>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <span className="text-4xl">🐕</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Management Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Patient records, medical history, and treatment plans will be available here.
            </p>
            <button className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProceduresSection = () => (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Medical Procedures</h3>
          <p className="text-sm text-gray-600">Track surgeries, diagnostics, and treatment procedures</p>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <span className="text-4xl">⚕️</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Procedure Tracking Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Surgery schedules, diagnostic results, and treatment protocols will be managed here.
            </p>
            <button className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule Procedure
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render functions for each section
  const renderOverviewSection = () => (
    <div className="p-6 space-y-0">
      {/* Overview Container - Full Width */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Overview</h3>
            <p className="text-gray-600 text-sm">
              Manage Availability
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Single Row Directly Underneath */}
      <div className="px-6 py-4 bg-gray-50">
        <StatsOverview 
          stats={stats}
          packages={packages}
          providerData={providerData}
          bookings={bookings}
          triageCases={triageCases}
        />
      </div>

      {/* Rest of the content with normal spacing */}
      <div className="p-6 space-y-6">
        {/* First Row - 2 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Marketplace Summary */}
          <MarketplaceSummary 
            listings={listings}
            packages={packages}
            products={products}
            setActiveSection={setActiveSection}
          />

          {/* Upcoming Bookings Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Bookings</h3>
                <button 
                  onClick={() => setActiveSection('schedule')} 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="p-6">
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings
                    .filter(booking => new Date(booking.appointment_date) >= new Date())
                    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
                    .slice(0, 3)
                    .map((booking, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{booking.pet_name}</p>
                        <p className="text-sm text-gray-600">
                          {booking.marketplace_listings?.name || booking.marketplace_listings?.service_types}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.appointment_time || 'Time TBD'}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bookings.filter(booking => new Date(booking.appointment_date) >= new Date()).length > 3 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{bookings.filter(booking => new Date(booking.appointment_date) >= new Date()).length - 3} more bookings
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No upcoming bookings</p>
                  <p className="text-sm text-gray-400">
                    Customer bookings will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Row - 2 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cases Summary */}
          {true && (
            <CasesSummary 
              triageCases={triageCases}
              setActiveSection={setActiveSection}
            />
          )}

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveSection('marketplace')} 
                  className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Manage Marketplace</div>
                    <div className="text-sm text-gray-600">Services & packages</div>
                  </div>
                </button>
                
                {/* Cases Quick Action - For Veterinarians and existing providers */}
                {(providerData?.provider_type === 'vet_nurse' || !providerData?.provider_type) && (
                <button 
                  onClick={() => setActiveSection('triage')} 
                  className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Cases</div>
                    <div className="text-sm text-gray-600">Review cases</div>
                  </div>
                </button>
                )}
                
                <button 
                  onClick={() => setActiveSection('schedule')} 
                  className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">View Bookings</div>
                    <div className="text-sm text-gray-600">Manage appointments</div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveSection('messages')} 
                  className="w-full flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Open Messages</div>
                    <div className="text-sm text-gray-600">View client messages</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Veterinarian-specific sections */}
      {providerData?.provider_type === 'veterinarian' && (
        <>
          {/* Clinic Overview */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">🏥 Clinic Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today's Appointments</span>
                  <span className="font-medium text-gray-900">{bookings.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString()).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Surgeries Scheduled</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Emergency Cases</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Procedures */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">⚕️ Recent Procedures</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No recent procedures</p>
                <p className="text-sm text-gray-400">
                  Completed surgeries and treatments will appear here
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">My Services</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your service offerings and create service packages</p>

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
                    // Navigate to marketplace to show services - more reliable than provider profile
                    window.open('/marketplace', '_blank');
                  }}
                  className="inline-flex items-center text-gray-500 hover:text-green-600 text-xs font-medium"
                  title="View Service Listings"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
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
                        {(listing.service_types || listing.service_type) === 'product' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Product
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{listing.description}</p>
                      {listing.brand && (
                        <p className="text-xs text-gray-500 mt-1">Brand: {listing.brand}</p>
                      )}
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === `service-${listing.listing_id || listing.id}` ? null : `service-${listing.listing_id || listing.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="More options"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                      
                      {openDropdown === `service-${listing.listing_id || listing.id}` && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                if ((listing.service_types || listing.service_type) === 'product') {
                                  // For products, pass the listing data directly since it contains all product info
                                  const productData = {
                                    id: listing.listing_id || listing.id,
                                    name: listing.name,
                                    description: listing.description,
                                    price: listing.price,
                                    category: listing.category,
                                    brand: listing.brand,
                                    stock_quantity: listing.stock_quantity,
                                    stockQuantity: listing.stock_quantity, // For form compatibility
                                    photos: listing.image_url ? [{ id: 1, url: listing.image_url, name: 'Product Image' }] : [],
                                    specifications: ''
                                  };
                                  setEditingProduct(productData);
                                  setShowAddProductModal(true);
                                } else {
                                  setEditingService(listing);
                                  setShowEditServiceModal(true);
                                }
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if ((listing.service_types || listing.service_type) === 'product') {
                                  const productId = (listing.listing_id || listing.id).replace('product_', '');
                                  handleDeleteProduct(productId, listing.name || listing.title);
                                } else {
                                  handleDeleteService(listing.listing_id || listing.id, listing.name || listing.title);
                                }
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Display photos for products */}
                  {(listing.service_types || listing.service_type) === 'product' && listing.photos && listing.photos.length > 0 && (
                    <div className="mb-3">
                      <div className="relative">
                        <img 
                          src={listing.photos[0].url} 
                          alt={listing.name || listing.title} 
                          className="w-full h-24 object-cover rounded-lg" 
                        />
                        {listing.photos.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                            +{listing.photos.length - 1} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">{(listing.service_types || listing.service_type) === 'product' ? listing.category : (listing.service_types || listing.service_type)}</p>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${listing.price || listing.price_from}</p>
                      <p className="text-xs text-gray-500">
                        You earn: ${getNetEarnings(listing.price || listing.price_from, (listing.service_types || listing.service_type) === 'product')}
                      </p>
                      {(listing.service_types || listing.service_type) === 'product' && (
                        <p className={`text-xs ${(listing.stockQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(listing.stockQuantity || 0) > 0 ? `${listing.stockQuantity || 0} in stock` : 'Out of stock'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first service to start accepting bookings.
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
             {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
               packages.length >= FREE_PACKAGE_LIMIT ? (
               <div className="flex items-center gap-2">
                 <span className="text-xs text-green-600 font-medium">
                   At limit - ${PACKAGE_MONTHLY_FEE}/month each
                 </span>
                 <button onClick={handleAddNewPackage} className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                   Create Package
                 </button>
               </div>
             ) : (
                             <button 
                onClick={handleAddNewPackage} 
                className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
                 Add Package
               </button>
             )}
           </div>
           {packages.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === `package-${pkg.id}` ? null : `package-${pkg.id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="More options"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          
                          {openDropdown === `package-${pkg.id}` && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setEditingPackage(pkg);
                                    setShowPackageModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const { data: { user } } = await supabase.auth.getUser();
                                      if (!user) return;

                                      // Update in Supabase
                                      const { error } = await supabase
                                        .from('packages')
                                        .update({ is_active: !pkg.is_active })
                                        .eq('id', pkg.id)
                                        .eq('provider_id', user.id);

                                      if (error) throw error;

                                      // Update local state
                                      const updatedPackages = packages.map(p => 
                                        p.id === pkg.id ? { ...p, is_active: !p.is_active } : p
                                      );
                                      setPackages(updatedPackages);
                                      setOpenDropdown(null);
                                    } catch (error) {
                                      console.error('Error updating package status:', error);
                                    }
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pkg.is_active ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                  </svg>
                                  {pkg.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeletePackage(pkg.id, pkg.name);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Services included:</span>
                        <span className="font-medium">{pkg.service_ids?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Original price:</span>
                        <span className="line-through text-gray-500">${pkg.original_price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Package price:</span>
                        <span className="font-bold text-green-600">${pkg.package_price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Customer saves:</span>
                        <span className="font-medium text-green-600">${pkg.savings?.toFixed(2)}</span>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages created yet</h3>
              <p className="text-gray-600 mb-4">
                Create service packages to offer customers better deals and increase your booking value.
              </p>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="border-t border-gray-200 pt-8">
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
            {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
              products.length >= FREE_PRODUCT_LIMIT ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 font-medium">
                  At limit - ${PRODUCT_MONTHLY_FEE}/month each
                </span>
                <button onClick={() => { setPayPerListingType('product'); setShowPayPerListingModal(true); }} className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add More Products
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddProductModal(true)} 
                className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            )}
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="relative ml-2">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === `product-${product.id}` ? null : `product-${product.id}`)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                      {openDropdown === `product-${product.id}` && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowAddProductModal(true);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          >
                            Edit Product
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteProduct(product.id, product.name);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            Delete Product
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {product.photos && product.photos.length > 0 && (
                    <div className="mb-3">
                      <img 
                        src={product.photos[0].url} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">${product.price}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stockQuantity}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products created yet</h3>
              <p className="text-gray-600 mb-4">
                Add veterinary products and supplies to sell to pet parents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );



  const renderProductsSection = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">My Products</h3>
            <p className="text-sm text-gray-600 mt-1">Sell veterinary products and supplies to pet parents</p>
            {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
              products.length >= FREE_PRODUCT_LIMIT && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-600 font-medium">
                  At limit - ${PRODUCT_MONTHLY_FEE}/month each
                </span>
                <button onClick={handleAddProduct} className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </button>
              </div>
            )}
          </div>
          {(!providerData?.subscription_plan || providerData?.subscription_plan === 'free') && 
            products.length < FREE_PRODUCT_LIMIT && (
            <button 
              onClick={() => setShowAddProductModal(true)} 
              className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          )}
          {providerData?.subscription_plan && providerData?.subscription_plan !== 'free' && (
            <button 
              onClick={() => setShowAddProductModal(true)} 
              className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                </div>
                <div className="relative ml-2">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === `product-${product.id}` ? null : `product-${product.id}`)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  
                  {openDropdown === `product-${product.id}` && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowAddProductModal(true);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

                             {product.photos && product.photos.length > 0 && (
                 <div className="mb-3">
                   <div className="relative">
                     <img 
                       src={product.photos[0].url} 
                       alt={product.name} 
                       className="w-full h-32 object-cover rounded-lg" 
                     />
                     {product.photos.length > 1 && (
                       <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                         +{product.photos.length - 1} more
                       </div>
                     )}
                   </div>
                 </div>
               )}

                              <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${(product.stockQuantity || 0) > 10 ? 'text-green-600' : (product.stockQuantity || 0) > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {product.stockQuantity || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-bold text-green-600">${product.price}</span>
                  </div>
                </div>

                              <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (product.stockQuantity || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(product.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products added yet</h3>
          <p className="text-gray-600 mb-4">
            Start selling veterinary products and supplies to provide additional value to your clients.
          </p>
          <button 
            onClick={() => setShowAddProductModal(true)} 
            className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Product
          </button>
        </div>
      )}
      </div>
    </div>
  );

  const renderTriageSection = () => (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Triage Cases</h3>
          <p className="text-sm text-gray-600">SOAP Note Reviews and Assessment Consultations</p>
        </div>
        <div className="p-6">
          {triageCases.length > 0 ? (
            <div className="space-y-4">
              {triageCases.map((case_item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {case_item.marketplace_listings?.service_types?.includes('SOAP') ? '📋' : '💬'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {case_item.marketplace_listings?.name || 'LuniTriage Case'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Customer: {case_item.customer_name} • Pet: {case_item.pet_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {new Date(case_item.created_at).toLocaleDateString()}
                      </span>
                      <button className="inline-flex items-center bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Start Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🩺</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No legacy triage cases</h3>
              <p className="text-gray-600">
                Old LuniTriage SOAP reviews and consultations would appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

      // New case management section for veterinarians
  const renderCasesSection = () => (
    <CaseManager nurseId={user?.id} />
  );

  const renderScheduleSection = () => (
    <div className="p-6 space-y-6">
      {/* Schedule Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Bookings & Availability</h3>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available Today
              </span>
              <button className="inline-flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Block Time
              </button>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Today - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
          
          <div className="space-y-3">
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📅</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h4>
              <p className="text-gray-600 text-sm">
                Today's appointments will appear here once they're scheduled
              </p>
            </div>

            {/* Available time slot */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Available for bookings</p>
                  <p className="text-xs text-gray-600">Open time slot</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">4:00 PM - 5:00 PM</p>
                <p className="text-xs text-green-600">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">This Week</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-gray-500 mb-2">{day}</div>
                <div className={`w-full h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-xs ${
                  index === 2 ? 'border-blue-300 bg-blue-50 text-blue-600' : 
                  index === 4 ? 'border-yellow-300 bg-yellow-50 text-yellow-600' : 
                  'border-gray-300 bg-gray-50 text-gray-500'
                }`}>
                  {index === 2 ? '3 appts' : index === 4 ? '2 appts' : 'Available'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Quick Actions</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Set Availability</div>
                <div className="text-sm text-gray-600">Update your working hours</div>
              </div>
            </button>

            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Block Time</div>
                <div className="text-sm text-gray-600">Reserve time slots</div>
              </div>
            </button>

            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">View All Bookings</div>
                <div className="text-sm text-gray-600">See upcoming appointments</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessagesSection = () => (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg">
        {/* Messages Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Messages</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              1 unread
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">
                Patient messages and communications will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSection = () => {
    // Calculate financial metrics
    const calculateRevenue = () => {
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const serviceRevenue = completedBookings.reduce((total, booking) => {
        const listing = listings.find(l => l.id === booking.listing_id);
        if (listing) {
          const price = parseFloat(listing.price_from || listing.price || 0);
          const netEarnings = parseFloat(getNetEarnings(price, listing.service_type === 'product'));
          return total + netEarnings;
        }
        return total;
      }, 0);

      // Estimate product revenue (since we don't have actual sales data)
      const productRevenue = products.length * 25; // Estimated average monthly revenue per product

      // Package revenue estimation
      const packageRevenue = packages.filter(p => p.is_active).reduce((total, pkg) => {
        return total + (pkg.package_price * 2); // Estimated 2 sales per month per package
      }, 0);

      return {
        total: serviceRevenue + productRevenue + packageRevenue,
        services: serviceRevenue,
        products: productRevenue,
        packages: packageRevenue
      };
    };

    const revenue = calculateRevenue();
    const thisMonthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.created_at);
      const now = new Date();
      return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
    });

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Analytics</h3>
          <p className="text-sm text-gray-700">
            Track your earnings from services, products, and packages. All figures show net earnings after platform fees.
          </p>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Total Earnings</h4>
              <span className="text-green-500">💵</span>
            </div>
            <p className="text-3xl font-bold text-green-600">${revenue.total.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Net earnings (after fees)</p>
          </div>
          
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Service Revenue</h4>
              <span className="text-blue-500">🛠️</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">${revenue.services.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{bookings.filter(b => b.status === 'completed').length} completed bookings</p>
          </div>
          
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Product Sales</h4>
              <span className="text-purple-500">📦</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">${revenue.products.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{products.length} products listed</p>
          </div>
          
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500">Package Revenue</h4>
              <span className="text-orange-500">📋</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">${revenue.packages.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{packages.filter(p => p.is_active).length} active packages</p>
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
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Services</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">${revenue.services.toFixed(2)}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${revenue.total > 0 ? (revenue.services / revenue.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Products</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">${revenue.products.toFixed(2)}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${revenue.total > 0 ? (revenue.products / revenue.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Packages</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">${revenue.packages.toFixed(2)}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
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
                <span className="text-sm text-gray-600">Booking Success Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Service Price</span>
                <span className="text-sm font-bold text-gray-900">
                  ${listings.length > 0 ? (listings.reduce((sum, l) => sum + parseFloat(l.price_from || 0), 0) / listings.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month Bookings</span>
                <span className="text-sm font-bold text-blue-600">{thisMonthBookings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Listings</span>
                <span className="text-sm font-bold text-gray-900">{listings.filter(l => l.active).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <span className="text-sm font-bold text-yellow-600">
                  {stats.averageRating > 0 ? `${stats.averageRating} ⭐` : 'No ratings yet'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h4>
          {bookings.filter(b => b.status === 'completed').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.filter(b => b.status === 'completed').slice(0, 5).map((booking) => {
                    const listing = listings.find(l => l.id === booking.listing_id);
                    const price = listing ? parseFloat(listing.price_from || listing.price || 0) : 0;
                    const earnings = listing ? getNetEarnings(price, listing.service_type === 'product') : '0.00';
                    
                    return (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.consultation_type || 'Service'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.customer_name || 'Customer'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
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
              <span className="text-4xl mb-4 block">💸</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed transactions yet</h3>
              <p className="text-gray-500">
                Once you complete services, your earnings will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Earning Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Tips to Increase Earnings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">📈</span>
              <div>
                <h5 className="font-medium text-gray-900">Create Package Deals</h5>
                <p className="text-sm text-gray-600">Bundle services together for higher-value bookings</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">⭐</span>
              <div>
                <h5 className="font-medium text-gray-900">Maintain High Ratings</h5>
                <p className="text-sm text-gray-600">Better ratings lead to more bookings and higher prices</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-500 mt-1">🛍️</span>
              <div>
                <h5 className="font-medium text-gray-900">Add Products</h5>
                <p className="text-sm text-gray-600">Sell veterinary products for additional passive income</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-orange-500 mt-1">📅</span>
              <div>
                <h5 className="font-medium text-gray-900">Update Availability</h5>
                <p className="text-sm text-gray-600">More availability means more booking opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileSection = () => {
    return (
      <div className="p-6 space-y-6">
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your public profile and contact details</p>
        </div>
        <div className="p-6">
          {/* Profile Picture Section */}
          <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  {profileForm.profilePicture ? (
                    <img 
                      src={profileForm.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-full flex items-center justify-center text-gray-400 ${profileForm.profilePicture ? 'hidden' : 'flex'}`}
                    style={{ display: profileForm.profilePicture ? 'none' : 'flex' }}
                  >
                    <span className="text-xl">👤</span>
                  </div>
                </div>
              </div>
                             <div>
                 <h4 className="font-medium text-gray-900">{profileForm.fullName || 'Your Name'}</h4>
                 <p className="text-sm text-gray-600">Profile Picture • Verified User</p>
               </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'profile-pic' ? null : 'profile-pic')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <span className="text-lg">⋮</span>
              </button>
              {openDropdown === 'profile-pic' && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        document.getElementById('profile-picture-input').click();
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="mr-3">📷</span>
                      Upload Photo
                    </button>
                    {profileForm.profilePicture && (
                      <button 
                        onClick={() => {
                          setProfileForm(prev => ({ ...prev, profilePicture: '' }));
                          setOpenDropdown(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <span className="mr-3">🗑️</span>
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <input 
              id="profile-picture-input"
              type="file" 
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={profileForm.fullName || ''} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Verified name cannot be changed"
              />
              <p className="text-xs text-gray-500 mt-1">Name is locked after verification for security</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={profile?.email || user?.email || ''} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Email address"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={profileForm.phone} 
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="+64279293666"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input 
                type="text" 
                value={profileForm.address} 
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="2 Heller Road"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">About/Bio</label>
            <textarea 
              value={profileForm.description} 
              onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell customers about yourself and your services..."
            />
          </div>

                      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                              <div>
                  <p className="text-sm text-gray-600">Changes will be reflected across your marketplace listing</p>
              </div>
              <button 
                onClick={handleSaveProfile}
                className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Changes
              </button>
            </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
          <p className="text-sm text-gray-600 mt-1">Your professional credentials and status</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{providerLabels.businessType}</p>
                                      <p className="text-xs text-gray-500">Veterinarian Business Type</p>
                </div>
                <span className="text-lg">🩺</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Verified</p>
                  <p className="text-xs text-gray-500">Status</p>
                </div>
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {providerData?.years_experience || profileForm.yearsOfExperience || 'Not specified'} 
                    {(providerData?.years_experience || profileForm.yearsOfExperience) && ' years'}
                  </p>
                  <p className="text-xs text-gray-500">Experience</p>
                  {/* Experience Level Badge */}
                  {(providerData?.years_experience || profileForm.yearsOfExperience) && (
                    <div className="mt-1">
                      {(() => {
                        const years = providerData?.years_experience || profileForm.yearsOfExperience;
                        const experienceLevel = getExperienceLevel(years, providerData?.provider_type);
                        const colorClasses = {
                          gray: 'bg-gray-100 text-gray-800',
                          blue: 'bg-blue-100 text-blue-800', 
                          green: 'bg-green-100 text-green-800',
                          purple: 'bg-purple-100 text-purple-800',
                          gold: 'bg-yellow-100 text-yellow-800'
                        };
                        return (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[experienceLevel.color]}`}>
                            {experienceLevel.level}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <span className="text-lg">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Service Areas</h3>
          <p className="text-sm text-gray-600 mt-1">Define where you provide services</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cities/Areas You Serve</label>
              <input 
                type="text" 
                value={profileForm.serviceAreas} 
                onChange={(e) => setProfileForm(prev => ({ ...prev, serviceAreas: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auckland, Hamilton, Tauranga"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Distance</label>
              <select 
                value={profileForm.maxTravelDistance} 
                onChange={(e) => setProfileForm(prev => ({ ...prev, maxTravelDistance: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Maximum distance you'll travel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive booking and message notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                <p className="text-sm text-gray-600">Receive tips and platform updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg border-l-4 border-red-400">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-red-600">Account Management</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Temporarily Disable Account</h4>
                <p className="text-sm text-gray-600">Hide your profile from customers temporarily</p>
              </div>
              <button className="inline-flex items-center bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Disable
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <button className="inline-flex items-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderMarketplaceSection = () => (
    <div className="p-6 space-y-8">
      {/* Marketplace Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Marketplace</h3>
            <p className="text-gray-600 text-sm">
              {providerData?.verified 
                ? "Your profile is live and accepting bookings" 
                : listings.length > 0 
                  ? "Ready to publish your services to the marketplace"
                  : "Create services to get started on the marketplace"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Marketplace Content - Services and Packages */}
      {renderServicesSection()}

    </div>
  );

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'marketplace':
        return renderMarketplaceSection();
      case 'services':
        return renderServicesSection();
      case 'packages':
        return renderServicesSection(); // Packages are now part of services
      case 'cases':
        return renderCasesSection(); // New case management for veterinarians
      case 'triage':
        return renderTriageSection(); // Legacy triage section
      case 'patients':
        return renderPatientsSection();
      case 'procedures':
        return renderProceduresSection();
      case 'schedule':
        return renderScheduleSection();
      case 'messages':
        return renderMessagesSection();
      case 'analytics':
        return renderAnalyticsSection();
      case 'profile':
        return renderProfileSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <ErrorBoundary message="There was an error loading your dashboard. Please try refreshing the page.">
      <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-100">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">{providerLabels.dashboardTitle}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {profile?.full_name || providerData?.name || 'Provider'}
          </p>
        </div>
        
        <nav className="">
          {sidebarItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                          activeSection === item.id
                            ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </button>
                    ))}
                  </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveSection()}
      </div>
      </div>

      {/* Modals */}
        {/* Qualification Submission Modal */}
        {showQualificationForm && (
        <QualificationForm
          providerData={providerData}
          onClose={() => setShowQualificationForm(false)}
          onSubmissionComplete={handleQualificationSubmissionComplete}
        />
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <ProviderAvailability
          providerId={profile?.id}
          onClose={() => setShowAvailabilityModal(false)}
        />
      )}

              {/* Create Service Modal */}
        {showCreateServiceModal && (
          <QuickServiceCards
            onClose={() => setShowCreateServiceModal(false)}
          />
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

        {/* Service Edit Modal */}
        {showEditServiceModal && editingService && (
          <ServiceEditForm
            service={editingService}
            onClose={() => {
              setShowEditServiceModal(false);
              setEditingService(null);
            }}
          />
        )}

      

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Today's Bookings</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">📅 Today's Appointments</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {new Date().toLocaleDateString('en-AU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {bookings.filter(booking => 
                new Date(booking.preferred_date).toDateString() === new Date().toDateString()
              ).length > 0 ? (
                <div className="space-y-3">
                  {bookings.filter(booking => 
                    new Date(booking.preferred_date).toDateString() === new Date().toDateString()
                  ).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.preferred_time}</h4>
                          <p className="text-sm text-gray-600">
                            {booking.customer_name} - {booking.pet_name} ({booking.pet_species})
                          </p>
                          <p className="text-xs text-gray-500">{booking.consultation_type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                  <p className="text-gray-600">Your schedule is clear for today.</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Messages Modal */}
        {showMessagesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Messages</h2>
                <button
                  onClick={() => setShowMessagesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">💬 Recent Messages</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Communicate with pet owners about their bookings and consultations.
                  </p>
                </div>

                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.customer_name}</h4>
                            <p className="text-sm text-gray-600">
                              Pet: {booking.pet_name} ({booking.pet_species})
                            </p>
                            <p className="text-xs text-gray-500">
                              Booking: {new Date(booking.preferred_date).toLocaleDateString()} at {booking.preferred_time}
                            </p>
                          </div>
                          <button className="text-[#5EB47C] hover:text-[#4A9A64] text-sm font-medium">
                            Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">Messages from pet owners will appear here.</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowMessagesModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">📊 Performance Overview</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Track your service performance and client satisfaction.
                  </p>
                </div>

                {/* Analytics Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Total Bookings</h4>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Completed Services</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => b.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Success rate: {
                      bookings.length > 0 ? 
                      Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0
                    }%</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Active Services</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {listings.filter(l => l.active).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Out of {listings.length} total</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Avg. Rating</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageRating > 0 ? `${stats.averageRating} ⭐` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Based on reviews</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h4>
                  {bookings.length > 0 ? (
                    <div className="space-y-2">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{booking.customer_name}</span>
                            <span className="text-gray-500 text-sm ml-2">
                              booked {booking.consultation_type}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowAnalyticsModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
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
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Active {payPerListingType === 'service' ? 'service listing' : payPerListingType === 'product' ? 'product listing' : 'service package listing'}{billingPeriod === 'yearly' ? 's' : ''} while subscribed
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Full marketplace visibility
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Same commission rates ({payPerListingType === 'service' ? SERVICE_COMMISSION_RATE * 100 : PRODUCT_COMMISSION_RATE * 100}%)
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {billingPeriod === 'yearly' ? 'Save 17% with yearly billing' : 'Flexible monthly billing'}
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
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
      </ErrorBoundary>
   );
 };
 
 export default ProviderDashboard;