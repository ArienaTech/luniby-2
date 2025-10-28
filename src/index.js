import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import './index.css';
import App from './App';
import './utils/cacheCleanup'; // Import cache cleanup utilities

// Initialize Sentry - use the centralized configuration from lib/sentry
// Just import it to trigger initialization
import './lib/sentry';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for performance optimization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New Service Worker available, will update on next visit');
            }
          });
        });
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
      
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'CACHE_UPDATED') {
        console.log('🔄 Cache updated by Service Worker');
        // Optionally reload the page to get fresh content
        // window.location.reload();
      }
    });
  });
  
  // Add global cache clearing function for debugging
  window.clearServiceWorkerCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('✅ Service Worker cache cleared successfully');
            console.log('🔄 Reloading page to get fresh content...');
            window.location.reload();
            resolve(true);
          }
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } else {
      console.log('❌ No Service Worker controller available');
      return false;
    }
  };
  
  // Legacy emergency cache clear function (kept for compatibility)
  window.emergencyClearCache = async () => {
    console.log('🚨 Emergency cache clear initiated...');
    console.log('ℹ️  Note: Using legacy method. Consider using clearAllCaches() for better results.');
    
    // Clear all caches manually
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log('🗑️ Unregistering service worker');
          return registration.unregister();
        })
      );
    }
    
    console.log('✅ Emergency cache clear completed. Reloading page...');
    window.location.reload();
  };

  // Cache prevention strategies with proper cleanup
  const initCachePrevention = () => {
    let cacheMonitorInterval = null;
    let maintenanceTimeout = null;
    let initialCheckTimeout = null;

    // Monitor cache size and warn if it gets too large
    const checkCacheSize = async () => {
      try {
        // Check storage quota first
        if (window.checkStorageQuota) {
          await window.checkStorageQuota();
        }

        if (window.getCacheInfo) {
          const info = await window.getCacheInfo();
          const totalCacheItems = 
            info.serviceWorker.caches.length +
            info.indexedDB.databases.length +
            info.localStorage.cacheItems.length +
            info.sessionStorage.itemCount +
            info.memory.advancedCache +
            info.memory.requestDeduplicator.pendingRequests +
            info.memory.requestDeduplicator.cachedRequests;
          
          if (totalCacheItems > 100) {
            console.warn('⚠️ High cache usage detected:', totalCacheItems, 'items');
            console.warn('💡 Consider running clearAllCaches() to improve performance');
            
            // Auto-optimize if usage is very high
            if (totalCacheItems > 200 && window.optimizeAllCaches) {
              console.log('🔧 Auto-optimizing caches due to high usage...');
              await window.optimizeAllCaches();
            }
          }
        }
      } catch (error) {
        console.error('Error checking cache size:', error);
      }
    };

    // Check cache size periodically
    cacheMonitorInterval = setInterval(checkCacheSize, 30 * 60 * 1000); // Every 30 minutes
    
    // Check cache size on page load
    initialCheckTimeout = setTimeout(checkCacheSize, 5000); // After 5 seconds

    // Automatically clean up old caches on app start
    maintenanceTimeout = setTimeout(async () => {
      try {
        if (window.clearSpecificCache) {
          // Clean up expired items without clearing everything
          console.log('🧹 Running automatic cache maintenance...');
          
          // Clear sessionStorage (temporary data)
          sessionStorage.clear();
          
          // The advancedCache already has automatic cleanup, but we can trigger it
          if (window.advancedCache && window.advancedCache.cleanup) {
            await window.advancedCache.cleanup();
          }
          
          console.log('✅ Automatic cache maintenance completed');
        }
      } catch (error) {
        console.error('Error during automatic cache maintenance:', error);
      }
    }, 10000); // After 10 seconds

    // Cleanup function to prevent memory leaks
    const cleanup = () => {
      if (cacheMonitorInterval) {
        clearInterval(cacheMonitorInterval);
        cacheMonitorInterval = null;
      }
      if (maintenanceTimeout) {
        clearTimeout(maintenanceTimeout);
        maintenanceTimeout = null;
      }
      if (initialCheckTimeout) {
        clearTimeout(initialCheckTimeout);
        initialCheckTimeout = null;
      }
    };

    // Register cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    // Return cleanup function for manual cleanup if needed
    return cleanup;
  };

  // Initialize cache prevention strategies
  const cacheCleanup = initCachePrevention();

  // Make cleanup available globally for debugging
  window.cleanupCacheMonitoring = cacheCleanup;
}
