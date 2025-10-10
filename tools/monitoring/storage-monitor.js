/**
 * PRODUCTION STORAGE MONITORING SCRIPT FOR LUNIBY
 * 
 * This script provides comprehensive storage monitoring for production environments.
 * Use this to track cache usage, detect issues, and maintain optimal performance.
 * 
 * Usage:
 * 1. Include this script in your production build
 * 2. Call StorageMonitor.init() on app startup
 * 3. Use StorageMonitor.getReport() to get current status
 * 4. Monitor logs for automatic warnings and cleanups
 */

class StorageMonitor {
  constructor() {
    this.isInitialized = false;
    this.monitoringInterval = null;
    this.reportHistory = [];
    this.maxReportHistory = 50;
    this.alertThresholds = {
      warning: 70,    // 70% storage usage
      critical: 85,   // 85% storage usage
      emergency: 95   // 95% storage usage
    };
    this.lastAlert = null;
    this.alertCooldown = 5 * 60 * 1000; // 5 minutes between alerts
  }

  /**
   * Initialize storage monitoring
   * @param {Object} options - Configuration options
   * @param {number} options.checkInterval - How often to check (milliseconds)
   * @param {boolean} options.autoCleanup - Enable automatic cleanup
   * @param {boolean} options.logToConsole - Log reports to console
   * @param {boolean} options.sendToAnalytics - Send data to analytics (implement as needed)
   */
  init(options = {}) {
    const config = {
      checkInterval: 10 * 60 * 1000, // 10 minutes
      autoCleanup: true,
      logToConsole: true,
      sendToAnalytics: false,
      ...options
    };

    if (this.isInitialized) {
      console.warn('StorageMonitor already initialized');
      return;
    }

    console.log('🔍 Initializing Production Storage Monitor');
    
    // Initial check
    this.checkStorageStatus();
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkStorageStatus();
    }, config.checkInterval);

    // Set up visibility change listener to check when user returns
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkStorageStatus();
      }
    });

    this.config = config;
    this.isInitialized = true;
    
    // Make available globally for debugging
    if (typeof window !== 'undefined') {
      window.StorageMonitor = this;
    }
  }

  /**
   * Check current storage status and take action if needed
   */
  async checkStorageStatus() {
    try {
      const report = await this.generateStorageReport();
      
      // Add to history
      this.reportHistory.unshift(report);
      if (this.reportHistory.length > this.maxReportHistory) {
        this.reportHistory = this.reportHistory.slice(0, this.maxReportHistory);
      }

      // Check thresholds and take action
      await this.handleStorageThresholds(report);

      // Log if configured
      if (this.config.logToConsole) {
        this.logReport(report);
      }

      // Send to analytics if configured
      if (this.config.sendToAnalytics) {
        this.sendToAnalytics(report);
      }

      return report;
    } catch (error) {
      console.error('❌ Storage monitoring error:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive storage report
   */
  async generateStorageReport() {
    const report = {
      timestamp: new Date().toISOString(),
      quota: await this.getStorageQuota(),
      caches: await this.getCacheInfo(),
      browserStorage: this.getBrowserStorageInfo(),
      performance: this.getPerformanceMetrics(),
      recommendations: []
    };

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const usagePercentage = quota > 0 ? (usage / quota) * 100 : 0;

        return {
          usage: usage,
          quota: quota,
          usagePercentage: usagePercentage,
          usageMB: (usage / 1024 / 1024).toFixed(2),
          quotaMB: (quota / 1024 / 1024).toFixed(2),
          available: quota - usage,
          availableMB: ((quota - usage) / 1024 / 1024).toFixed(2)
        };
      }
    } catch (error) {
      console.warn('Could not get storage quota:', error);
    }
    
    return { error: 'Storage quota API not available' };
  }

  /**
   * Get cache information
   */
  async getCacheInfo() {
    const info = {
      serviceWorker: { count: 0, size: 0 },
      indexedDB: { count: 0, size: 0 },
      memory: { count: 0, size: 0 }
    };

    try {
      // Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        info.serviceWorker.count = cacheNames.length;
        
        // Estimate cache sizes (this is approximate)
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          info.serviceWorker.size += keys.length * 1024; // Rough estimate
        }
      }

      // IndexedDB
      if ('indexedDB' in window && indexedDB.databases) {
        const databases = await indexedDB.databases();
        info.indexedDB.count = databases.length;
      }

      // Memory caches (if available)
      if (window.getCacheInfo) {
        const cacheDetails = await window.getCacheInfo();
        info.memory.count = 
          (cacheDetails.memory?.advancedCache || 0) +
          (cacheDetails.memory?.requestDeduplicator?.cachedRequests || 0);
      }
    } catch (error) {
      console.warn('Error getting cache info:', error);
    }

    return info;
  }

  /**
   * Get browser storage information
   */
  getBrowserStorageInfo() {
    const info = {
      localStorage: { count: 0, size: 0, cacheItems: 0 },
      sessionStorage: { count: 0, size: 0 }
    };

    try {
      // localStorage
      info.localStorage.count = localStorage.length;
      let localStorageSize = 0;
      let cacheItems = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        if (value) {
          localStorageSize += key.length + value.length;
          
          // Count cache-related items
          if (key.toLowerCase().includes('cache') || 
              key.toLowerCase().includes('temp') ||
              key.startsWith('products_') ||
              key.startsWith('packages_')) {
            cacheItems++;
          }
        }
      }
      
      info.localStorage.size = localStorageSize;
      info.localStorage.sizeMB = (localStorageSize / 1024 / 1024).toFixed(2);
      info.localStorage.cacheItems = cacheItems;

      // sessionStorage
      info.sessionStorage.count = sessionStorage.length;
      let sessionStorageSize = 0;
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        if (value) {
          sessionStorageSize += key.length + value.length;
        }
      }
      
      info.sessionStorage.size = sessionStorageSize;
      info.sessionStorage.sizeMB = (sessionStorageSize / 1024 / 1024).toFixed(2);
    } catch (error) {
      console.warn('Error getting browser storage info:', error);
    }

    return info;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const metrics = {
      loadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      memoryUsage: null
    };

    try {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        }

        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          metrics.firstContentfulPaint = fcp.startTime;
        }

        // Memory usage (Chrome only)
        if ('memory' in performance) {
          metrics.memoryUsage = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
            totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
          };
        }
      }
    } catch (error) {
      console.warn('Error getting performance metrics:', error);
    }

    return metrics;
  }

  /**
   * Generate recommendations based on current state
   */
  generateRecommendations(report) {
    const recommendations = [];

    // Storage quota recommendations
    if (report.quota && !report.quota.error) {
      if (report.quota.usagePercentage > 90) {
        recommendations.push({
          type: 'critical',
          message: 'Storage usage is very high (>90%). Run emergency cleanup immediately.',
          action: 'window.emergencyCleanup()'
        });
      } else if (report.quota.usagePercentage > 70) {
        recommendations.push({
          type: 'warning',
          message: 'Storage usage is high (>70%). Consider clearing caches.',
          action: 'window.clearAllCaches()'
        });
      }
    }

    // Cache recommendations
    const totalCacheItems = 
      report.caches.serviceWorker.count +
      report.caches.indexedDB.count +
      report.caches.memory.count +
      report.browserStorage.localStorage.cacheItems;

    if (totalCacheItems > 150) {
      recommendations.push({
        type: 'warning',
        message: `High cache item count (${totalCacheItems}). Consider optimization.`,
        action: 'window.optimizeAllCaches()'
      });
    }

    // Memory recommendations
    if (report.performance.memoryUsage) {
      const memoryUsagePercent = (report.performance.memoryUsage.used / report.performance.memoryUsage.limit) * 100;
      if (memoryUsagePercent > 80) {
        recommendations.push({
          type: 'warning',
          message: 'High memory usage detected. Consider clearing memory caches.',
          action: 'Reload page or clear caches'
        });
      }
    }

    return recommendations;
  }

  /**
   * Handle storage threshold alerts and automatic actions
   */
  async handleStorageThresholds(report) {
    if (!report.quota || report.quota.error) return;

    const now = Date.now();
    const shouldAlert = !this.lastAlert || (now - this.lastAlert) > this.alertCooldown;

    if (report.quota.usagePercentage >= this.alertThresholds.emergency) {
      if (shouldAlert) {
        console.error('🚨 EMERGENCY: Storage usage at 95%+!');
        this.lastAlert = now;
        
        // Send alert (implement your alerting system here)
        this.sendAlert('emergency', report);
      }
      
      // Automatic emergency cleanup
      if (this.config.autoCleanup && window.emergencyCleanup) {
        await window.emergencyCleanup();
      }
    } else if (report.quota.usagePercentage >= this.alertThresholds.critical) {
      if (shouldAlert) {
        console.warn('⚠️ CRITICAL: Storage usage at 85%+');
        this.lastAlert = now;
        
        this.sendAlert('critical', report);
      }
      
      // Automatic optimization
      if (this.config.autoCleanup && window.optimizeAllCaches) {
        await window.optimizeAllCaches();
      }
    } else if (report.quota.usagePercentage >= this.alertThresholds.warning) {
      if (shouldAlert) {
        console.warn('⚠️ WARNING: Storage usage at 70%+');
        this.lastAlert = now;
        
        this.sendAlert('warning', report);
      }
    }
  }

  /**
   * Log report to console
   */
  logReport(report) {
    if (report.quota && !report.quota.error) {
      console.log(`📊 Storage: ${report.quota.usageMB}MB / ${report.quota.quotaMB}MB (${report.quota.usagePercentage.toFixed(1)}%)`);
    }
    
    console.log(`🗂️ Caches: SW(${report.caches.serviceWorker.count}) IDB(${report.caches.indexedDB.count}) Memory(${report.caches.memory.count})`);
    console.log(`💾 Browser Storage: localStorage(${report.browserStorage.localStorage.count}) sessionStorage(${report.browserStorage.sessionStorage.count})`);
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`   ${rec.type.toUpperCase()}: ${rec.message}`);
      });
    }
  }

  /**
   * Send alert (implement based on your alerting system)
   */
  sendAlert(level, report) {
    // Implement your alerting logic here
    // Examples:
    // - Send to monitoring service (DataDog, New Relic, etc.)
    // - Send email/SMS alert
    // - Log to error tracking service (Sentry, Bugsnag, etc.)
    // - Send to analytics
    
    console.log(`🚨 ALERT [${level.toUpperCase()}]: Storage monitoring alert`, {
      level,
      timestamp: report.timestamp,
      quota: report.quota,
      recommendations: report.recommendations
    });
  }

  /**
   * Send data to analytics (implement as needed)
   */
  sendToAnalytics(report) {
    // Implement your analytics logic here
    // Examples:
    // - Google Analytics custom events
    // - Mixpanel tracking
    // - Custom analytics endpoint
    
    console.log('📈 Analytics: Storage report', {
      quota_usage_percent: report.quota?.usagePercentage,
      cache_count: report.caches.serviceWorker.count + report.caches.indexedDB.count,
      localStorage_items: report.browserStorage.localStorage.count,
      recommendations_count: report.recommendations.length
    });
  }

  /**
   * Get current storage report
   */
  async getReport() {
    return await this.checkStorageStatus();
  }

  /**
   * Get report history
   */
  getHistory(limit = 10) {
    return this.reportHistory.slice(0, limit);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isInitialized = false;
    console.log('🛑 Storage monitoring stopped');
  }

  /**
   * Export report as JSON (for debugging)
   */
  exportReport(report = null) {
    const reportToExport = report || this.reportHistory[0];
    if (!reportToExport) {
      console.warn('No report available to export');
      return null;
    }
    
    const blob = new Blob([JSON.stringify(reportToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return reportToExport;
  }
}

// Create singleton instance
const storageMonitor = new StorageMonitor();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storageMonitor;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.StorageMonitor = storageMonitor;
  
  // Convenience functions
  window.getStorageReport = () => storageMonitor.getReport();
  window.exportStorageReport = () => storageMonitor.exportReport();
  window.getStorageHistory = () => storageMonitor.getHistory();
}

export default storageMonitor;