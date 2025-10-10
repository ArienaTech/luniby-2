import React, { memo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { supabase } from '../lib/supabase.js';

// Memoized category icon component for better performance
const CategoryIcon = memo(({ category, listingType }) => {
  if (listingType === 'product') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }

  if (listingType === 'provider') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }

  const icons = {
    'Veterinary': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    'Pet Grooming': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H9m0-5a1.5 1.5 0 011.5-1.5H12a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H10.5A1.5 1.5 0 019 11.5V10z" />
      </svg>
    ),
    'Pet Training': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    'Pet Breeding': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    default: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  };

  return icons[category] || icons.default;
});

CategoryIcon.displayName = 'CategoryIcon';

// Optimized image component with basic lazy loading
const OptimizedImage = memo(({ src, alt, className }) => {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Memoized marketplace card component
const MarketplaceCard = memo(({ listing }) => {
  const [providerServices, setProviderServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch services for provider listings
  useEffect(() => {
    const fetchProviderServices = async () => {
      if (listing.listing_type !== 'provider' || (!listing.provider_email && !listing.provider_id)) return;
      
      setServicesLoading(true);
      try {
        let query = supabase
          .from('marketplace_listings')
          .select('listing_id, name, service_types, price, provider_email')
          .eq('active', true)
          .not('service_type', 'like', '%LuniTriage%') // Exclude LuniTriage services
          .order('service_type', { ascending: true }) // Order by service_type to group Mobile services first

        // Try provider_email first, then provider_id approach
        if (listing.provider_email) {
          query = query.eq('provider_email', listing.provider_email);
        } else if (listing.provider_id) {
          // Get provider email first, then use it to fetch services
          const { data: providerData } = await supabase
            .from('providers')
            .select('email')
            .eq('id', listing.provider_id)
            .single();
            
          if (providerData?.email) {
            query = query.eq('provider_email', providerData.email);
          } else {
            console.log('No provider email found for provider_id:', listing.provider_id);
            setServicesLoading(false);
            return;
          }
        } else {
          console.log('No provider_email or provider_id found for listing:', listing.name);
          setServicesLoading(false);
          return;
        }

        const { data: services, error } = await query;

        if (!error && services) {
          // Store all services for count, but show top 3 for display
          const allNonLuniServices = services.filter(service => 
            !service.service_type.includes('LuniTriage')
          );
          
          // Prioritize Mobile services first for display
          const mobileServices = services
            .filter(service => 
              !service.service_type.includes('LuniTriage') &&
              service.service_type.includes('Mobile')
            )
            .slice(0, 3);
          
          // If we don't have 3 mobile services, fill with other non-LuniTriage services
          if (mobileServices.length < 3) {
            const otherServices = services
              .filter(service => 
                !service.service_type.includes('LuniTriage') &&
                !service.service_type.includes('Mobile')
              )
              .slice(0, 3 - mobileServices.length);
            mobileServices.push(...otherServices);
          }
          
          // Add total count to the services for display
          const servicesWithCount = mobileServices.map(service => ({
            ...service,
            totalCount: allNonLuniServices.length
          }));
          
          console.log('Fetched services for provider:', listing.name);
          console.log('Total non-LuniTriage services:', allNonLuniServices.length);
          console.log('Top 3 services to display:', servicesWithCount);
          setProviderServices(servicesWithCount);
        } else if (error) {
          console.error('Error fetching services for provider:', listing.name, error);
        }
      } catch (error) {
        console.error('Error fetching provider services:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchProviderServices();
  }, [listing.listing_type, listing.provider_email, listing.provider_id]);

  // Get fallback emoji for category
  const getCategoryEmoji = useCallback((category, listingType) => {
    if (listingType === 'product') return '📦';
    if (listingType === 'provider') return '👩‍⚕️';
    
    const emojis = {
      'Veterinary': '🏥',
      'Pet Grooming': '✂️',
      'Pet Training': '🎓',
      'Pet Breeding': '🐕',
      'Nutritionists': '🥗',
      'Holistic Care': '🌿',
      'vet_nurse': '👩‍⚕️'
    };
    
    return emojis[category] || '🐾';
  }, []);

  // Get price range for provider services
  const getPriceRange = useCallback(() => {
    if (listing.listing_type !== 'provider') {
      return `$${listing.price || 0}`;
    }

    // For providers, use the pre-calculated price range
    if (listing.price_min && listing.price_max) {
      if (listing.price_min === listing.price_max) {
        return `$${listing.price_min}`;
      } else {
        return `$${listing.price_min} - $${listing.price_max}`;
      }
    }

    // Fallback to providerServices if available
    if (providerServices.length > 0) {
      const prices = providerServices.map(service => parseFloat(service.price_from));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return `$${minPrice}`;
      } else {
        return `$${minPrice} - $${maxPrice}`;
      }
    }

    return `$${listing.price || 0}`;
  }, [listing, providerServices]);

  return (
    <Link
      to={listing.listing_type === 'provider' ? `/provider/${encodeURIComponent(listing.provider_email || listing.provider_id)}` : 
          listing.listing_type === 'service' ? `/provider/${encodeURIComponent(listing.provider_email || listing.provider_id)}` : 
          `/product/${listing.listing_id}`}
      className="group h-full"
      onClick={handleScrollToTop}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        {/* Listing Image */}
        <div className="relative h-44 sm:h-52 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-2xl overflow-hidden">
          {listing.image_url && (
            <OptimizedImage
              src={listing.image_url}
              alt={listing.name}
              className="w-full h-full object-cover border-0"
            />
          )}
          <div className={`${listing.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-base`}>
            {getCategoryEmoji(listing.category, listing.listing_type)}
          </div>
          
          {/* Listing Type Badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium font-montserrat ${
              listing.listing_type === 'product' 
                ? 'bg-[#E5F4F1] text-[#4A9A64]' 
                : listing.listing_type === 'provider'
                ? 'bg-[#f0f4ff] text-[#3b82f6]'
                : 'bg-[#fef7f0] text-[#e06b1a]'
            }`}>
              <CategoryIcon category={listing.category} listingType={listing.listing_type} />
              <span className="ml-1 hidden sm:inline">
                {listing.listing_type === 'product' ? 'Product' : 
                 listing.listing_type === 'provider' ? 'Provider' : 'Service'}
              </span>
            </span>
          </div>

          {/* Top right badges and favorite button */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center space-x-2">
            {/* Verified Badge */}
            {listing.verified && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#E5F4F1] text-[#4A9A64] font-montserrat">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Verified</span>
              </span>
            )}
            
            {/* Favorite Button */}
            <FavoriteButton
              listingId={listing.listing_id}
              listingType={listing.listing_type}
              size="sm"
              className="z-10"
            />
          </div>
        </div>

        {/* Listing Content */}
        <div className="flex-1 flex flex-col p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 mb-2 font-montserrat group-hover:text-[#5EB47C] transition-colors min-w-0 line-clamp-2">
            {listing.name}
          </h3>
          
          {/* Description - Show services for providers */}
          <div className="text-sm text-gray-600 mb-3 font-montserrat flex-1">
            {listing.listing_type === 'provider' && providerServices.length > 0 ? (
              <div className="space-y-1">
                {providerServices.slice(0, 3).map((service, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>• {service.title}</span>
                    <span className="font-medium">${service.price_from}</span>
                  </div>
                ))}
                {providerServices[0]?.totalCount > 3 && (
                  <div className="text-xs text-gray-500 mt-1">
                    + {(providerServices[0]?.totalCount || providerServices.length) - 3} more services
                  </div>
                )}
              </div>
            ) : listing.listing_type === 'provider' && servicesLoading ? (
              <div className="text-xs text-gray-400">Loading services...</div>
            ) : (
              <div className="line-clamp-2">{listing.description}</div>
            )}
          </div>

          {/* Provider Info */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-[#E5F4F1] rounded-full flex items-center justify-center mr-3">
              <span className="text-[#5EB47C] font-medium text-sm font-montserrat">
                {listing.provider_name?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 font-montserrat truncate">
                {listing.provider_name || 'Provider'}
              </p>
              {listing.rating > 0 && (
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-montserrat">
                    {listing.rating} ({listing.reviews_count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price and Location */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 font-montserrat">
                {getPriceRange()}
                {listing.listing_type === 'service' && (
                  <span className="text-xs font-normal text-gray-500 ml-1">per session</span>
                )}
                {listing.listing_type === 'provider' && providerServices.length > 0 && (
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    {providerServices[0]?.totalCount || providerServices.length} service{(providerServices[0]?.totalCount || providerServices.length) !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
            {listing.city && (
              <div className="flex items-center text-gray-500 ml-2 flex-shrink-0">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-montserrat truncate">{listing.city}</span>
              </div>
            )}
          </div>

          {/* Stock for products */}
          {listing.listing_type === 'product' && listing.stock_quantity !== null && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-montserrat ${
                listing.stock_quantity > 10 
                  ? 'bg-green-100 text-green-800' 
                  : listing.stock_quantity > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {listing.stock_quantity > 10 ? 'In Stock' : 
                 listing.stock_quantity > 0 ? `${listing.stock_quantity} left` : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

MarketplaceCard.displayName = 'MarketplaceCard';

export default MarketplaceCard;