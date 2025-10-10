import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../lib/supabase';
import { subscribeToAuth } from '../lib/auth-manager.js';
import favoritesService from '../services/favoritesService';
import { useNavigate } from 'react-router-dom';
import { initializeFavorites } from '../utils/initializeFavorites';

// Create a context to manage favorites globally and avoid N+1 queries
const FavoritesContext = createContext();

// Favorites Provider Component
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(new Set());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserAndFavorites();
    
    // Use centralized auth manager
    const unsubscribe = subscribeToAuth(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setUser(session?.user || null);
        if (session?.user) {
          const result = await favoritesService.getUserFavorites(session.user.id);
          if (result.success) {
            const favoriteKeys = new Set(
              result.data.map(fav => `${fav.listing_type}-${fav.listing_id}`)
            );
            setFavorites(favoriteKeys);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFavorites(new Set());
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserAndFavorites = async () => {
    try {
      console.log('🔄 Loading user and favorites...');
      
      // First, try to initialize the favorites system
      const initResult = await initializeFavorites();
      if (!initResult.success && initResult.needsSetup) {
        console.warn('⚠️ Favorites system needs database setup');
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        // Handle auth session missing gracefully
        if (userError.message?.includes('Auth session missing')) {
          console.log('ℹ️ No auth session - user not logged in');
        } else {
          console.error('❌ Error getting user:', userError);
        }
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      setUser(user);
      console.log('👤 User loaded:', user ? user.email : 'No user');
      
      if (user) {
        console.log('📋 Loading favorites for user:', user.id);
        const result = await favoritesService.getUserFavorites(user.id);
        
        if (result.success) {
          const favoriteKeys = new Set(
            result.data.map(fav => `${fav.listing_type}-${fav.listing_id}`)
          );
          setFavorites(favoriteKeys);
          console.log('✅ Loaded favorites:', favoriteKeys.size, 'items');
        } else {
          console.error('❌ Error loading favorites:', result.error);
          // If the table doesn't exist, we'll still continue but log the error
          if (result.error.includes('relation "user_favorites" does not exist')) {
            console.warn('⚠️ user_favorites table does not exist - favorites will not work until table is created');
          }
        }
      } else {
        setFavorites(new Set());
      }
    } catch (error) {
      console.error('❌ Error loading user favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (listingId, listingType) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    const favoriteKey = `${listingType}-${listingId}`;
    const isFavorited = favorites.has(favoriteKey);
    
    // Optimistic update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(favoriteKey);
    } else {
      newFavorites.add(favoriteKey);
    }
    setFavorites(newFavorites);

    try {
      console.log('🔄 Toggling favorite:', { listingId, listingType, isFavorited });
      const result = await favoritesService.toggleFavorite(user.id, listingId, listingType);
      
      if (!result.success) {
        console.error('❌ Failed to toggle favorite:', result.error);
        // Revert optimistic update on error
        setFavorites(favorites);
        return result;
      }
      
      console.log('✅ Successfully toggled favorite');
      return result;
    } catch (error) {
      console.error('❌ Error in toggleFavorite:', error);
      // Revert optimistic update on error
      setFavorites(favorites);
      return { success: false, error: error.message };
    }
  };

  const isFavorite = (listingId, listingType) => {
    return favorites.has(`${listingType}-${listingId}`);
  };

  return (
    <FavoritesContext.Provider value={{
      user,
      favorites,
      isLoading,
      toggleFavorite,
      isFavorite,
      refreshFavorites: loadUserAndFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

const FavoriteButton = ({ 
  listingId, 
  listingType, 
  className = '', 
  size = 'md',
  showTooltip = true,
  onToggle = null 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  
  // Use favorites context instead of individual API calls
  const { user, isFavorite, toggleFavorite: contextToggleFavorite } = useFavorites();
  const isFavorited = isFavorite(listingId, listingType);

  // Size variants - Airbnb style with larger touch targets
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigation if button is inside a link
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('💖 Heart icon clicked!', { listingId, listingType, user: !!user, isFavorited });
    
    if (!user) {
      console.log('👤 No user logged in, redirecting to signin');
      navigate('/signin');
      return;
    }

    if (isLoading) {
      console.log('⏳ Already loading, ignoring click');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);
    
    try {
      console.log('🔄 Calling contextToggleFavorite...');
      const result = await contextToggleFavorite(listingId, listingType);
      
      if (result.success) {
        console.log('✅ Favorite toggled successfully');
        
        // Call onToggle callback if provided
        if (onToggle) {
          onToggle(!isFavorited, listingId, listingType);
        }
        
        // Show success feedback
        const action = isFavorited ? 'Removed from favorites' : 'Added to favorites';
        console.log('💖', action);
        
        // Reset animation state after animation completes
        setTimeout(() => setIsAnimating(false), 600);
      } else {
        setIsAnimating(false);
        console.error('❌ Error toggling favorite:', result.error);
        
        // Show user-friendly error message
        if (result.error.includes('relation "user_favorites" does not exist')) {
          console.error('💔 Favorites table does not exist in database');
        }
      }
    } catch (error) {
      setIsAnimating(false);
      console.error('❌ Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if missing required props
  if (!listingId || !listingType) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex items-center justify-center
        transition-all duration-300 ease-out
        transform
        ${isHovered ? 'scale-110' : 'scale-100'}
        focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50
        ${!user 
          ? 'bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-md hover:shadow-lg'
          : isFavorited 
            ? 'bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl' 
            : 'bg-white/80 backdrop-blur-sm hover:bg-white/95 shadow-md hover:shadow-lg'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isAnimating && isFavorited && user ? 'favorite-glow' : ''}
        border border-white/20
        group
        ${className}
      `}
      title={showTooltip ? (!user ? 'Sign in to add to favorites' : (isFavorited ? 'Remove from favorites' : 'Add to favorites')) : ''}
      aria-label={!user ? 'Sign in to add to favorites' : (isFavorited ? 'Remove from favorites' : 'Add to favorites')}
    >
      {isLoading ? (
        <div className={`${iconSizes[size]} animate-spin`}>
          <svg className="w-full h-full text-red-400" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <div className="relative">
          {/* Heart Icon with Airbnb-style animation */}
          <svg 
            className={`
              ${iconSizes[size]} 
              transition-all duration-300 ease-out
              ${!user
                ? isHovered 
                  ? 'text-gray-500 scale-105' 
                  : 'text-gray-400'
                : isFavorited 
                  ? 'text-red-500 scale-110' 
                  : isHovered 
                    ? 'text-red-400 scale-105' 
                    : 'text-gray-600'
              }
              ${isAnimating && user ? 'heart-pop' : ''}
              ${isFavorited && isHovered && user ? 'heart-beat' : ''}
            `}
            fill={user && isFavorited ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={user && isFavorited ? "0" : "2"} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          
          {/* Animated pulse effect when favorited */}
          {user && isFavorited && (
            <div className="absolute inset-0 rounded-full">
              <svg 
                className={`${iconSizes[size]} text-red-500 animate-ping opacity-30`}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
        </div>
      )}
    </button>
  );
};

export default FavoriteButton;