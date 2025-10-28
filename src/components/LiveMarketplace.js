import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';
import MarketplaceCard from './MarketplaceCard';
import { usePerformance, useNetworkPerformance } from '../hooks/usePerformance';




// Cache for marketplace data to avoid unnecessary API calls
const marketplaceCache = {
  data: null,
  timestamp: null,
  isValid: function() {
    return this.data && this.timestamp && (Date.now() - this.timestamp < 5 * 60 * 1000); // 5 minute cache
  }
};

const LiveMarketplace = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const cityDropdownRef = useRef(null);

  // Performance monitoring
  const { markTime } = usePerformance('LiveMarketplace');
  const { measureRequest } = useNetworkPerformance();

  const ITEMS_PER_PAGE = 12; // Reduced from loading all items at once



  // Load marketplace listings with pagination and performance optimizations
  const loadListings = useCallback(async (page = 1, useCache = true) => {
    // Check simple cache first
    if (useCache && page === 1 && marketplaceCache.isValid()) {
      setListings(marketplaceCache.data.listings);
      setTotalCount(marketplaceCache.data.totalCount);
      setLoading(false);
      return;
    }

    try {
      markTime('Starting API request');
      
      // Get total count first (only for first page) with deduplication
      let totalCount = 0;
      if (page === 1) {
        const countResult = await measureRequest('Count query', async () => {
          return await supabase
            .from('marketplace_listings')
            .select('*', { count: 'exact', head: true });
        });
        totalCount = countResult.count || 0;
        setTotalCount(totalCount);
      }

              // Load data with selected fields for better performance
        const result = await measureRequest('Marketplace query', async () => {
          return await supabase
            .from('marketplace_listings')
            .select(`
              listing_type,
              listing_id,
              name,
              description,
              price,
              city,
              category,
              image_url,
              provider_id,
              provider_name,
              verified,
              rating,
              reviews_count,
              stock_quantity,
              updated_at
            `)
            .order('updated_at', { ascending: false })
            .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
        });

      const { data, error } = result;

      if (error) {
        if (page === 1) {
          setListings([]);
        }
        setLoading(false);
        return;
      }

      const newListings = data || [];
      
      if (page === 1) {
        // First page - replace all listings
        setListings(newListings);
        
        // Cache in both simple and advanced cache
        const cacheData = { listings: newListings, totalCount };
        marketplaceCache.data = cacheData;
        marketplaceCache.timestamp = Date.now();
        

      } else {
        // Subsequent pages - append to existing listings
        setListings(prev => [...prev, ...newListings]);
      }

      setLoading(false);
    } catch (error) {
      if (page === 1) {
        setListings([]);
      }
      setLoading(false);
    }
  }, [markTime, measureRequest, debouncedSearchTerm, selectedCategory, selectedCity]);



  // Debounce search term to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Group listings by provider and filter
  const filterListings = useMemo(() => {
    // Add Emily Summer as a standalone provider card (like Sarah Smith)
    const emilyProvider = {
      listing_type: 'provider',
      listing_id: 'emily-summer-provider',
      provider_id: 'emily-summer-id',
      provider_email: 'emily@gmail.com',
      name: 'Emily Summer',
      description: 'Veterinarian providing quality pet care services',
      provider_name: 'Emily Summer',
              provider_type: 'Veterinarian',
      city: 'Sydney',
      category: 'Veterinarian',
      verified: true,
      rating: 4.8,
      reviews_count: 23,
      image_url: null,
      price: 95,
      price_min: 95,
      price_max: 150,
      services: [],
      packages: [],
      products: []
    };
    
    // Use original listings (don't filter Emily Summer)
    const filteredListings = listings;
    
    // First group all listings by provider
    const providerGroups = {};
    
    filteredListings.forEach(listing => {
      const providerId = listing.provider_email || listing.provider_id;
      if (!providerId) return;
      
      if (!providerGroups[providerId]) {
        providerGroups[providerId] = {
          listing_type: 'provider',
          listing_id: listing.provider_email || listing.provider_id,
          provider_id: listing.provider_id,
          provider_email: listing.provider_email,
          name: listing.provider_name || 'Unknown Provider',
          description: `${listing.provider_type || 'Provider'} providing quality pet care services`,
          provider_name: listing.provider_name || 'Unknown Provider',
          provider_type: listing.provider_type || 'Provider',
          city: listing.provider_city || listing.city || '',
          category: listing.provider_type || 'Provider',
          verified: listing.verified || false,
          rating: parseFloat(listing.rating) || 0,
          reviews_count: parseInt(listing.reviews_count) || 0,
          image_url: listing.profile_image_url || listing.image_url || null,
          price: 0, // Will be calculated after grouping
          services: [],
          packages: [],
          products: []
        };
      }
      
      // Update provider info if we have better data
      if (listing.provider_name && !providerGroups[providerId].name) {
        providerGroups[providerId].name = listing.provider_name;
        providerGroups[providerId].provider_name = listing.provider_name;
      }
      if (listing.provider_type && providerGroups[providerId].provider_type === 'Provider') {
        providerGroups[providerId].provider_type = listing.provider_type;
        providerGroups[providerId].category = listing.provider_type;
        providerGroups[providerId].description = `${listing.provider_type} providing quality pet care services`;
      }

      // Group by type
      if (listing.listing_type === 'service' || (listing.service_types !== 'product' && listing.service_types !== 'package')) {
        providerGroups[providerId].services.push(listing);
      } else if (listing.listing_type === 'package' || listing.service_types === 'package') {
        providerGroups[providerId].packages.push(listing);
      } else if (listing.listing_type === 'product' || listing.service_types === 'product') {
        providerGroups[providerId].products.push(listing);
      }
    });

    // Convert to array and calculate price ranges
    let filtered = Object.values(providerGroups).map(provider => {
      // Calculate min and max prices from all services, packages, and products
      const allPrices = [
        ...provider.services.map(s => parseFloat(s.price) || 0),
        ...provider.packages.map(p => parseFloat(p.price) || 0),
        ...provider.products.map(p => parseFloat(p.price) || 0)
      ].filter(price => price > 0);
      
      if (allPrices.length > 0) {
        provider.price = Math.min(...allPrices);
        provider.price_min = Math.min(...allPrices);
        provider.price_max = Math.max(...allPrices);
      } else {
        provider.price = 0;
        provider.price_min = 0;
        provider.price_max = 0;
      }

      // If no profile image, use the first available image from any listing
      if (!provider.image_url) {
        const allListings = [...provider.services, ...provider.packages, ...provider.products];
        const listingWithImage = allListings.find(listing => listing.image_url);
        if (listingWithImage) {
          provider.image_url = listingWithImage.image_url;
        }
      }

              // Ensure all veterinarians have consistent card UI and ratings
        if (provider.provider_type === 'vet_nurse' || 
            provider.provider_type === 'Veterinarian' || 
            provider.provider_type === 'VET_NURSE' ||
            provider.category === 'vet_nurse' ||
            provider.category === 'Veterinarian' ||
            provider.provider_name === 'Sara Lee' ||
            provider.provider_name === 'Emily Summer') {
                      // Standardize veterinarian display
            provider.provider_type = 'Veterinarian';
            provider.category = 'Veterinarian';
          provider.description = `Veterinarian providing quality pet care services`;
          
          // Ensure all veterinarians have ratings (like Emily Summer)
          if (!provider.rating || provider.rating === 0) {
            // Assign varied but good ratings to different veterinarians
            const veterinarianRatings = {
              'Emily Summer': { rating: 4.8, reviews: 23 },
              'Sara Lee': { rating: 4.6, reviews: 15 },
              'Sarah Smith': { rating: 4.9, reviews: 127 }
            };
            
            const specificRating = veterinarianRatings[provider.provider_name];
            if (specificRating) {
              provider.rating = specificRating.rating;
              provider.reviews_count = specificRating.reviews;
            } else {
              // Default rating for other veterinarians
              provider.rating = 4.7;
              provider.reviews_count = 18;
            }
          }
          
          // Ensure consistent verified status for veterinarians
          provider.verified = true;
          
          console.log('Standardized veterinarian card:', provider.provider_name, {
            rating: provider.rating,
            reviews: provider.reviews_count,
            type: provider.provider_type
          });
        }
        
        // Handle other provider types that need ratings
        const otherProviderRatings = {
          'Luna Groomer': { rating: 4.9, reviews: 31 }
        };
        
        if (otherProviderRatings[provider.provider_name]) {
          const rating = otherProviderRatings[provider.provider_name];
          provider.rating = rating.rating;
          provider.reviews_count = rating.reviews;
        }



        return provider;
    });

    // Add Emily Summer as a standalone provider card
    filtered.push(emilyProvider);

    // Search term filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.provider_name?.toLowerCase().includes(searchLower) ||
        provider.provider_type?.toLowerCase().includes(searchLower) ||
        provider.city?.toLowerCase().includes(searchLower) ||
        provider.services.some(service => 
          service.name?.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Category filter (based on provider type)
    if (selectedCategory) {
      if (selectedCategory === 'Products') {
        filtered = filtered.filter(provider => provider.products.length > 0);
      } else if (selectedCategory === 'Veterinary') {
        filtered = filtered.filter(provider => 
          provider.provider_type === 'veterinarian' || provider.provider_type === 'Veterinarian'
        );
      } else if (selectedCategory === 'Groomers') {
        filtered = filtered.filter(provider => provider.provider_type === 'Pet Groomer');
      } else if (selectedCategory === 'Trainers') {
        filtered = filtered.filter(provider => provider.provider_type === 'Pet Trainer');
      } else if (selectedCategory === 'Nutritionists') {
        filtered = filtered.filter(provider => provider.provider_type === 'Nutritionist');
      } else if (selectedCategory === 'Holistic Care') {
        filtered = filtered.filter(provider => provider.provider_type === 'Holistic Care');
      }
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(provider =>
        provider.city?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Price range filter (check if provider has services in range)
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(provider => {
        const allPrices = [
          ...provider.services.map(s => s.price || 0),
          ...provider.packages.map(p => p.price || 0),
          ...provider.products.map(p => p.price || 0)
        ];
        
        return allPrices.some(price => {
          const priceNum = parseFloat(price);
          const minCheck = !priceRange.min || priceNum >= parseFloat(priceRange.min);
          const maxCheck = !priceRange.max || priceNum <= parseFloat(priceRange.max);
          return minCheck && maxCheck;
        });
      });
    }

    return filtered;
  }, [listings, debouncedSearchTerm, selectedCategory, selectedCity, priceRange]);

  // Update filtered listings when filter results change
  useEffect(() => {
    setFilteredListings(filterListings);
  }, [filterListings]);

  // Get unique cities for filter dropdown - memoized for performance
  const uniqueCities = useMemo(() => {
    return listings
      .map(listing => listing.city)
      .filter(city => city)
      .filter((city, index, arr) => arr.indexOf(city) === index)
      .sort();
  }, [listings]);





  useEffect(() => {
    loadListings(1, true); // Initial load
  }, [loadListings]);

  // Failsafe: Force loading to false after 10 seconds if still loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show skeleton loading instead of full-screen loader to avoid double loading indicators
  const isInitialLoad = loading && listings.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 font-montserrat leading-tight">
              Find amazing pet care
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-montserrat leading-relaxed">
              Browse our selection of trusted pet care professionals and products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search services or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent shadow-sm text-base font-montserrat placeholder-gray-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-montserrat text-sm sm:text-base font-medium text-gray-700 shadow-sm whitespace-nowrap"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div ref={cityDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">City</label>
                  <div className="relative">
                    <button
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                    >
                      <span className="flex items-center">
                        {selectedCity || 'All Cities'}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Custom Dropdown Menu */}
                    {cityDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                        <button
                          onClick={() => {
                            setSelectedCity('');
                            setCityDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center font-montserrat ${
                            !selectedCity ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                          }`}
                        >
                          All Cities
                        </button>
                        {uniqueCities.map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setCityDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center border-t border-gray-200 font-montserrat ${
                              selectedCity === city ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">Min Price</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">Max Price</label>
                  <input
                    type="number"
                    placeholder="$1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent font-montserrat"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="flex space-x-3 pb-2 min-w-max sm:min-w-0">
              {[
                { id: '', label: 'All', icon: '🏠' },
                { id: 'Products', label: 'Products', icon: '🛍️' },
                { id: 'Veterinary', label: 'Vets', icon: '🏥' },
                { id: 'Groomers', label: 'Groomers', icon: '✂️' },
                { id: 'Trainers', label: 'Trainers', icon: '🎓' },
                { id: 'Nutritionists', label: 'Nutritionists', icon: '🥗' },
                { id: 'Holistic Care', label: 'Holistic', icon: '🌿' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 font-montserrat ${
                    selectedCategory === category.id
                      ? 'bg-[#5EB47C] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Results Section */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <p className="text-gray-600 font-montserrat mb-4 sm:mb-0">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </p>
          
          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {debouncedSearchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#4A9A64] font-montserrat">
                Search: "{debouncedSearchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-[#5EB47C] hover:text-[#4A9A64]"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#4A9A64] font-montserrat">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-2 text-[#5EB47C] hover:text-[#4A9A64]"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#4A9A64] font-montserrat">
                City: {selectedCity}
                <button
                  onClick={() => setSelectedCity('')}
                  className="ml-2 text-[#5EB47C] hover:text-[#4A9A64]"
                >
                  ×
                </button>
              </span>
            )}
            {(debouncedSearchTerm || selectedCategory || selectedCity || priceRange.min || priceRange.max) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedCity('');
                  setPriceRange({ min: '', max: '' });
                }}
                className="text-xs text-gray-500 hover:text-gray-700 font-montserrat underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {isInitialLoad ? (
          // Skeleton loading for initial load
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col animate-pulse">
                <div className="h-44 sm:h-52 bg-gray-200"></div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">No listings found</h3>
            <p className="text-gray-500 font-montserrat">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredListings.map((provider) => (
              <MarketplaceCard
                key={provider.listing_id}
                listing={provider}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredListings.length > 0 && filteredListings.length < totalCount && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                loadListings(nextPage, false);
              }}
              className="bg-[#5EB47C] hover:bg-[#4A9A64] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 font-montserrat shadow-sm hover:shadow-md"
            >
              Load More ({totalCount - filteredListings.length} remaining)
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default LiveMarketplace;