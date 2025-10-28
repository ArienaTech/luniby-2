import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import favoritesService from '../services/favoritesService';
import FavoriteButton from './FavoriteButton';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'services', 'products'
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const checkAuthAndLoadFavorites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signin');
        return;
      }

      setUser(user);
      await loadFavorites(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  }, [navigate, setUser]);

  const loadFavorites = useCallback(async (userId) => {
    try {
      setLoading(true);
      const result = await favoritesService.getUserFavoritesWithDetails(userId);
      
      if (result.success) {
        setFavorites(result.data);
      } else {
        console.error('Error loading favorites:', result.error);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterFavorites = useCallback(() => {
    let filtered = [...favorites];

    // Filter by type
    if (filterType === 'services') {
      filtered = filtered.filter(fav => fav.listing_type === 'service');
    } else if (filterType === 'products') {
      filtered = filtered.filter(fav => fav.listing_type === 'product');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(fav =>
        fav.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFavorites(filtered);
  }, [favorites, filterType, searchTerm]);

  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, [checkAuthAndLoadFavorites]);

  useEffect(() => {
    filterFavorites();
  }, [favorites, filterType, searchTerm, filterFavorites]);

  const handleFavoriteToggle = (isFavorited, listingId, listingType) => {
    if (!isFavorited) {
      // Remove from favorites list when unfavorited
      setFavorites(prev => prev.filter(fav => 
        !(fav.listing_id === listingId && fav.listing_type === listingType)
      ));
    }
  };

  const getCategoryIcon = (category, listingType) => {
    if (listingType === 'product') return '📦';
    
    const icons = {
      'Veterinary': '🏥',
      'Pet Grooming': '✂️',
      'Pet Training': '🎓',
      'Pet Breeding': '🐕',
      'Nutritionists': '🥗',
      'Holistic Care': '🌿',
      'Dog Walking': '🚶',
      'Pet Sitting': '🏠',
      'Pet Boarding': '🏨'
    };
    
    return icons[category] || '🐾';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-montserrat">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-lg font-bold text-gray-900 font-montserrat">My Favorites</h1>
              <p className="text-gray-600 font-montserrat">
                {favorites.length} saved {favorites.length === 1 ? 'listing' : 'listings'}
              </p>
            </div>
            <Link
              to="/marketplace"
              className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] font-montserrat transition-colors"
            >
              Browse More
            </Link>
          </div>
        </div>
      </div>

      <section className="pt-8 pb-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-900 mb-2 font-montserrat">No favorites yet</h3>
            <p className="text-gray-500 mb-6 font-montserrat">Start browsing and save your favorite services and products!</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] font-montserrat transition-colors"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search your favorites..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C] font-montserrat"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="sm:w-48">
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EB47C] focus:border-[#5EB47C] font-montserrat"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="services">Services Only</option>
                    <option value="products">Products Only</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-gray-600 font-montserrat">
                Showing {filteredFavorites.length} of {favorites.length} favorites
              </div>
            </div>

            {/* Favorites Grid */}
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">No matches found</h3>
                <p className="text-gray-500 font-montserrat">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite) => (
                  <Link
                    key={`${favorite.listing_type}-${favorite.listing_id}`}
                    to={favorite.listing_type === 'service' ? `/provider/${favorite.provider_id}` : `/product/${favorite.listing_id}`}
                    className="group h-full"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                      {/* Listing Image */}
                      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-2xl overflow-hidden">
                        {favorite.image_url ? (
                          <img
                            src={favorite.image_url}
                            alt={favorite.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`${favorite.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-4xl`}>
                          {getCategoryIcon(favorite.category, favorite.listing_type)}
                        </div>
                        
                        {/* Top badges */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-montserrat ${
                            favorite.listing_type === 'product' 
                              ? 'bg-[#E5F4F1] text-[#4A9A64]' 
                              : 'bg-[#fef7f0] text-[#e06b1a]'
                          }`}>
                            {getCategoryIcon(favorite.category, favorite.listing_type)}
                            <span className="ml-1">{favorite.listing_type === 'product' ? 'Product' : 'Service'}</span>
                          </span>
                        </div>

                        {/* Favorite button */}
                        <div className="absolute top-3 right-3">
                          <FavoriteButton
                            listingId={favorite.listing_id}
                            listingType={favorite.listing_type}
                            size="sm"
                            onToggle={handleFavoriteToggle}
                          />
                        </div>

                        {/* Favorited date */}
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white font-montserrat">
                            Saved {new Date(favorite.favorited_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Listing Content */}
                      <div className="flex-1 flex flex-col p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 font-montserrat group-hover:text-[#5EB47C] transition-colors">
                          {favorite.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 font-montserrat line-clamp-2">
                          {favorite.description}
                        </p>

                        {/* Provider Info */}
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-[#E5F4F1] rounded-full flex items-center justify-center mr-3">
                            <span className="text-[#5EB47C] font-medium text-sm font-montserrat">
                              {favorite.provider_name?.charAt(0) || 'P'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 font-montserrat truncate">
                              {favorite.provider_name || 'Provider'}
                            </p>
                            {favorite.provider_rating > 0 && (
                              <div className="flex items-center">
                                <div className="flex text-yellow-400 mr-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 font-montserrat">
                                  {favorite.provider_rating} ({favorite.reviews_count})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price and Location */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900 font-montserrat">
                              ${favorite.price}
                              {favorite.listing_type === 'service' && (
                                <span className="text-xs font-normal text-gray-500 ml-1">per session</span>
                              )}
                            </p>
                          </div>
                          {favorite.city && (
                            <div className="flex items-center text-gray-500 ml-2 flex-shrink-0">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-xs font-montserrat truncate">{favorite.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </section>
    </div>
  );
};

export default FavoritesPage;