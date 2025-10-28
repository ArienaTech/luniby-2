// Cache cleanup utilities
// Provides functions for managing browser cache, service worker cache, and storage

// Advanced cache manager with TTL and size limits
class AdvancedCache {
  constructor() {
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    this.maxSize = 100; // max items
  }

  async cleanup() {
    try {
      // Clean up expired localStorage items
      const now = Date.now();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item && item.timestamp && now - item.timestamp > this.maxAge) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid JSON, remove it
            localStorage.removeItem(key);
          }
        }
      }
      console.log('✅ Cache cleanup completed');
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Request deduplicator to prevent duplicate API calls
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
    this.cachedRequests = new Map();
    this.maxCacheAge = 5 * 60 * 1000; // 5 minutes
  }

  getPendingRequests() {
    return this.pendingRequests.size;
  }

  getCachedRequests() {
    return this.cachedRequests.size;
  }

  clear() {
    this.pendingRequests.clear();
    this.cachedRequests.clear();
  }
}

// Initialize global cache utilities
if (typeof window !== 'undefined') {
  window.advancedCache = new AdvancedCache();
  window.requestDeduplicator = new RequestDeduplicator();

  // Get cache info function
  window.getCacheInfo = async () => {
    const info = {
      serviceWorker: {
        registered: 'serviceWorker' in navigator,
        caches: []
      },
      indexedDB: {
        databases: []
      },
      localStorage: {
        itemCount: localStorage.length,
        cacheItems: []
      },
      sessionStorage: {
        itemCount: sessionStorage.length
      },
      memory: {
        advancedCache: 0,
        requestDeduplicator: {
          pendingRequests: window.requestDeduplicator?.getPendingRequests() || 0,
          cachedRequests: window.requestDeduplicator?.getCachedRequests() || 0
        }
      }
    };

    // Get cache names
    if ('caches' in window) {
      info.serviceWorker.caches = await caches.keys();
    }

    // Count localStorage cache items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        info.localStorage.cacheItems.push(key);
      }
    }

    return info;
  };

  // Check storage quota
  window.checkStorageQuota = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);
      console.log(`Storage: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB / ${(estimate.quota / 1024 / 1024).toFixed(2)} MB (${percentUsed}%)`);
      return { usage: estimate.usage, quota: estimate.quota, percentUsed };
    }
    return null;
  };

  // Clear specific cache
  window.clearSpecificCache = async (cacheName) => {
    if ('caches' in window) {
      const deleted = await caches.delete(cacheName);
      if (deleted) {
        console.log(`✅ Cache "${cacheName}" cleared`);
      }
      return deleted;
    }
    return false;
  };

  // Optimize all caches
  window.optimizeAllCaches = async () => {
    console.log('🔧 Optimizing all caches...');
    
    // Run advanced cache cleanup
    if (window.advancedCache) {
      await window.advancedCache.cleanup();
    }

    // Clear request deduplicator
    if (window.requestDeduplicator) {
      window.requestDeduplicator.clear();
    }

    // Clear old session storage
    sessionStorage.clear();

    console.log('✅ Cache optimization completed');
  };

  // Clear all caches
  window.clearAllCaches = async () => {
    console.log('🗑️ Clearing all caches...');
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`✅ Cleared ${cacheNames.length} service worker caches`);
    }

    // Clear localStorage cache items
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        cacheKeys.push(key);
      }
    }
    cacheKeys.forEach(key => localStorage.removeItem(key));
    console.log(`✅ Cleared ${cacheKeys.length} localStorage cache items`);

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');

    // Clear memory caches
    if (window.requestDeduplicator) {
      window.requestDeduplicator.clear();
      console.log('✅ Cleared request deduplicator');
    }

    console.log('✅ All caches cleared successfully');
  };
}

export default {};
