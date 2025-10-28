// Network connection monitoring utility
class ConnectionMonitor {
  constructor() {
    this.online = navigator.onLine;
    this.listeners = new Set();
    this.connectionQuality = 'good';
    this.initialized = false;
    
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  initialize() {
    if (this.initialized) return;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.online = true;
      this.connectionQuality = 'good';
      this.notifyListeners();
      console.log('✅ Connection restored');
    });

    window.addEventListener('offline', () => {
      this.online = false;
      this.connectionQuality = 'offline';
      this.notifyListeners();
      console.warn('⚠️ Connection lost');
    });

    // Monitor connection quality using Network Information API if available
    if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        const updateConnectionQuality = () => {
          const effectiveType = connection.effectiveType;
          
          switch (effectiveType) {
            case '4g':
              this.connectionQuality = 'good';
              break;
            case '3g':
              this.connectionQuality = 'moderate';
              break;
            case '2g':
            case 'slow-2g':
              this.connectionQuality = 'poor';
              break;
            default:
              this.connectionQuality = 'unknown';
          }
          
          this.notifyListeners();
        };

        connection.addEventListener('change', updateConnectionQuality);
        updateConnectionQuality();
      }
    }

    this.initialized = true;
    console.log('✅ Connection monitor initialized');
  }

  // Subscribe to connection changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of connection change
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          online: this.online,
          quality: this.connectionQuality
        });
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }

  // Check if online
  isOnline() {
    return this.online;
  }

  // Get connection quality
  getQuality() {
    return this.connectionQuality;
  }

  // Test connection with a ping
  async testConnection(url = '/') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeout);
      
      if (response.ok) {
        this.online = true;
        return true;
      }
      return false;
    } catch (error) {
      this.online = false;
      return false;
    }
  }
}

// Create singleton instance
const connectionMonitor = new ConnectionMonitor();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.connectionMonitor = connectionMonitor;
}

export default connectionMonitor;
