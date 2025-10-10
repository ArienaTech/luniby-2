import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import ConsultationBooking from './ConsultationBooking';
import FavoriteButton from './FavoriteButton';

const ProviderDetail = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);

  useEffect(() => {
    const loadProviderData = async () => {
      try {
        const decodedProviderId = decodeURIComponent(providerId);
        
        // Load provider's listings from marketplace_listings first
        let providerEmail = decodedProviderId;
        
        // If it's not an email, try to find by provider_id
        if (!decodedProviderId.includes('@')) {
          const { data: sampleListing } = await supabase
            .from('marketplace_listings')
            .select('provider_email')
            .eq('provider_id', decodedProviderId)
            .limit(1)
            .single();
          
          if (sampleListing?.provider_email) {
            providerEmail = sampleListing.provider_email;
          } else {
            console.error('Provider not found with ID:', decodedProviderId);
            setLoading(false);
            return;
          }
        }

        // Load all provider's listings from marketplace_listings
        const { data: allListingsData, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('provider_email', providerEmail)
          .eq('active', true);

        if (listingsError || !allListingsData || allListingsData.length === 0) {
          console.error('No listings found for provider:', providerEmail, listingsError);
          setLoading(false);
          return;
        }

        // Create provider data from the first listing
        const firstListing = allListingsData[0];
        let rating = firstListing.rating || 0;
        let reviews_count = firstListing.reviews_count || 0;
        
        // Add default ratings for specific providers if they don't have ratings
        if (rating === 0 || !rating) {
          const defaultRatings = {
            'Emily Summer': { rating: 4.8, reviews: 23 },
            'Sara Lee': { rating: 4.6, reviews: 15 },
            'Sarah Smith': { rating: 4.9, reviews: 127 },
            'Luna Groomer': { rating: 4.9, reviews: 31 }
          };
          
          const providerRating = defaultRatings[firstListing.provider_name];
          if (providerRating) {
            rating = providerRating.rating;
            reviews_count = providerRating.reviews;
          } else if (firstListing.provider_type === 'vet_nurse' || firstListing.provider_type === 'Vet Nurse') {
            // Default rating for other vet nurses
            rating = 4.7;
            reviews_count = 18;
          }
        }
        
        const providerData = {
          id: firstListing.provider_id || providerEmail,
          email: firstListing.provider_email,
          name: firstListing.provider_name,
          provider_type: firstListing.provider_type,
          phone: firstListing.provider_phone,
          address: firstListing.provider_address,
          city: firstListing.provider_city || firstListing.city,
          verified: firstListing.verified || true, // Default to verified for better UX
          rating: rating,
          reviews_count: reviews_count,
          profile_image_url: firstListing.profile_image_url,
          offers_services: true,
          offers_products: true
        };

        setProvider(providerData);

        if (!listingsError && allListingsData) {
          // Separate services, packages, and products
          const servicesData = allListingsData.filter(listing => 
            listing.listing_type === 'service' || 
            (listing.listing_type !== 'product' && listing.listing_type !== 'package' && 
             listing.service_types !== 'product' && listing.service_types !== 'package')
          );
          
          const packagesData = allListingsData.filter(listing => 
            listing.listing_type === 'package' || listing.service_types === 'package'
          );
          
          const productsData = allListingsData.filter(listing => 
            listing.listing_type === 'product' || listing.service_types === 'product'
          );

          // Map services to the expected format
          const mappedServices = servicesData.map(listing => ({
            id: listing.listing_id,
            title: listing.name,
            description: listing.description,
            price: listing.price,
            duration_minutes: 30, // Default duration
            service_type: listing.service_types || listing.service_type,
            location_type: 'mobile'
          }));

          // Map packages to the expected format
          const mappedPackages = packagesData.map(listing => ({
            id: listing.listing_id,
            name: listing.name,
            description: listing.description,
            package_price: listing.price,
            original_price: listing.price * 1.2, // Assume 20% discount
            savings: listing.price * 0.2,
            is_active: listing.active
          }));

          // Map products to the expected format
          const mappedProducts = productsData.map(listing => ({
            id: listing.listing_id,
            name: listing.name,
            description: listing.description,
            price: listing.price,
            category: listing.category,
            brand: listing.brand,
            stock_quantity: listing.stock_quantity,
            image_url: listing.image_url
          }));
            
          setServices(mappedServices);
          setPackages(mappedPackages);
          setProducts(mappedProducts);
        } else if (listingsError) {
          console.error('Error loading listings:', listingsError);
        }

        // All data (services, packages, products) is now loaded from marketplace_listings above

        setLoading(false);
      } catch (error) {
        
        setLoading(false);
      }
    };

    if (providerId) {
      loadProviderData();
    }
  }, [providerId]);

  // Booking handlers
  const handleBookConsultation = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  // Package system logic - now uses actual packages from provider dashboard

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handlePackageSelect = (packageData) => {
    // Use service_ids from the actual package data
    setSelectedServices(packageData.service_ids || []);
  };

  const getSelectedTotal = () => {
    return services
      .filter(service => selectedServices.includes(service.id))
      .reduce((total, service) => total + parseFloat(service.price || 0), 0);
  };

  const getSelectedDuration = () => {
    return services
      .filter(service => selectedServices.includes(service.id))
      .reduce((total, service) => total + (service.duration_minutes || 30), 0);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const getProviderTypeIcon = (type) => {
    const icons = {
      'Veterinary': '🏥',
      'Vet Nurse': '👩‍⚕️',
      'Groomer': '✂️',
      'Trainer': '🎓',
      'Breeder': '🐕',
      'Nutritionist': '🥗',
      'Pet Business': '🏪',
      'Holistic Care': '🌿',
      'Expert': '🎯'
    };
    return icons[type] || '🐾';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">Provider not found</h3>
          <p className="text-gray-500 font-montserrat mb-4">The provider you're looking for doesn't exist.</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors font-montserrat"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Provider Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Provider Avatar */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                {provider.profile_image_url ? (
                  <img
                    src={provider.profile_image_url}
                    alt={provider.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-base">
                    {getProviderTypeIcon(provider.provider_type)}
                  </span>
                )}
              </div>
            </div>

            {/* Provider Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-montserrat">
                      {provider.business_name || provider.name}
                    </h1>
                    {provider.verified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 font-montserrat">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {provider.business_name && provider.name !== provider.business_name && (
                    <p className="text-base sm:text-lg text-gray-600 font-montserrat mb-2">by {provider.name}</p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 font-montserrat">
                    <span className="flex items-center">
                      <span className="mr-2">{getProviderTypeIcon(provider.provider_type)}</span>
                      {provider.provider_type}
                    </span>
                    {provider.city && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {provider.city}, {provider.country}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating Display */}
                  <div className="flex items-center mt-3">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900 mr-2 font-montserrat">
                      {provider.rating || 4.8}
                    </span>
                    <span className="text-gray-600 font-montserrat">
                      ({provider.reviews_count || 23} review{(provider.reviews_count || 23) !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Contact Button and Favorite */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <FavoriteButton
                    listingId={provider.id}
                    listingType="service"
                    size="md"
                    className="self-center sm:self-start"
                  />
                  <button className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-[#5EB47C] text-white rounded-xl hover:bg-[#4A9A64] transition-colors font-montserrat font-medium">
                    Contact Provider
                  </button>
                </div>
              </div>



              {/* Bio */}
              {provider.bio && (
                <p className="text-gray-700 font-montserrat leading-relaxed">
                  {provider.bio}
                </p>
              )}

              {/* Offerings */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-4">
                {provider.offers_services && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E5F4F1] text-[#4A9A64] font-montserrat">
                    🛠️ Services
                  </span>
                )}
                {provider.offers_products && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 font-montserrat">
                    🛍️ Products
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {provider.offers_services && (
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 font-medium text-sm font-montserrat whitespace-nowrap ${
                  activeTab === 'services'
                    ? 'text-[#5EB47C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Services ({services.length})
              </button>
            )}
            {provider.offers_products && (
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 font-medium text-sm font-montserrat whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'text-[#5EB47C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Products ({products.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 font-medium text-sm font-montserrat whitespace-nowrap ${
                activeTab === 'about'
                  ? 'text-[#5EB47C]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && provider.offers_services && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 font-montserrat">
              Book Services
            </h2>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-montserrat">No services available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Popular Packages */}
                {packages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 font-montserrat">
                      📦 Popular Packages
                    </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 font-montserrat">{pkg.name}</h4>
                            <p className="text-sm text-gray-600 font-montserrat">{pkg.description}</p>
                          </div>
                                                      <div className="text-right">
                            <p className="text-xl font-bold text-green-600 font-montserrat">${pkg.package_price}</p>
                            <p className="text-xs text-gray-500 line-through font-montserrat">${pkg.original_price}</p>
                            <p className="text-xs text-green-600 font-bold font-montserrat">Save ${pkg.savings}!</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2 font-montserrat">Includes:</p>
                          <ul className="text-sm text-gray-600 space-y-1 font-montserrat">
                            {pkg.service_ids?.map((serviceId, index) => {
                              const service = services.find(s => s.id === serviceId);
                              return service ? (
                                <li key={index} className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {service.title}
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                        
                        <button 
                          onClick={() => {
                            handlePackageSelect(pkg);
                            setShowCustomBuilder(true);
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-montserrat font-medium"
                        >
                          Select Package
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Custom Package Builder */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 font-montserrat">
                      🔧 Build Custom Package
                    </h3>
                    <button
                      onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                      className="text-blue-600 hover:text-blue-700 font-medium font-montserrat"
                    >
                      {showCustomBuilder ? 'Hide Builder' : 'Show Builder'}
                    </button>
                  </div>
                  
                  {showCustomBuilder && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`service-${service.id}`}
                                checked={selectedServices.includes(service.id)}
                                onChange={() => handleServiceToggle(service.id)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`service-${service.id}`} className="ml-3 flex-1">
                                <div className="font-medium text-gray-900 font-montserrat">{service.title}</div>
                                {service.description && (
                                  <div className="text-sm text-gray-500 font-montserrat">{service.description}</div>
                                )}
                              </label>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 font-montserrat">${service.price}</div>
                              {service.duration_minutes && (
                                <div className="text-xs text-gray-500 font-montserrat">{service.duration_minutes} min</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedServices.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium text-gray-900 font-montserrat">
                                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                              </p>
                              <p className="text-sm text-gray-500 font-montserrat">
                                Estimated time: {getSelectedDuration()} minutes
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 font-montserrat">
                                ${getSelectedTotal().toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              // Handle booking multiple services
                              const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id));
                              setSelectedService({ 
                                title: `${selectedServices.length} Services Package`,
                                price: getSelectedTotal(),
                                duration_minutes: getSelectedDuration(),
                                services: selectedServiceObjects
                              });
                              setShowBookingModal(true);
                            }}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-montserrat font-medium"
                          >
                            Book Selected Services
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && provider.offers_products && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 font-montserrat">
              Products Available
            </h2>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-montserrat">No products available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-primary-100 to-primary-200 h-48 rounded-t-2xl overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover border-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base">
                          📦
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 font-montserrat flex-1">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-gray-900 font-montserrat ml-2">
                          ${product.price}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-montserrat">
                          {product.category}
                        </span>
                        {product.brand && (
                          <span className="text-xs text-gray-500 font-montserrat">
                            {product.brand}
                          </span>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mb-4 font-montserrat line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-montserrat ${
                          product.stock_quantity > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock_quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_quantity > 10 ? 'In Stock' : 
                           product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
                        </span>
                        
                        <button 
                          disabled={product.stock_quantity === 0}
                          className={`px-4 py-2 rounded-lg font-montserrat font-medium transition-colors ${
                            product.stock_quantity > 0
                              ? 'bg-[#5EB47C] text-white hover:bg-[#4A9A64]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 font-montserrat">
              About {provider.business_name || provider.name}
            </h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 font-montserrat">Contact Information</h3>
                  <div className="space-y-2 text-sm text-gray-600 font-montserrat">
                    {provider.email && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {provider.email}
                      </p>
                    )}
                    {provider.phone && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {provider.phone}
                      </p>
                    )}
                    {provider.address && (
                      <p className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {provider.address}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3 font-montserrat">Business Details</h3>
                  <div className="space-y-2 text-sm text-gray-600 font-montserrat">
                    <p><span className="font-medium">Type:</span> {provider.provider_type}</p>
                    <p><span className="font-medium">Verified:</span> {provider.verified ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Member since:</span> {new Date(provider.created_at).toLocaleDateString()}</p>

                  </div>
                </div>
              </div>

              {provider.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 font-montserrat">About</h3>
                  <p className="text-gray-700 font-montserrat leading-relaxed">
                    {provider.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Consultation Booking Modal */}
      {showBookingModal && selectedService && provider && (
        <ConsultationBooking
          service={selectedService}
          provider={provider}
          onClose={closeBookingModal}
        />
      )}
    </div>
  );
};

export default ProviderDetail;