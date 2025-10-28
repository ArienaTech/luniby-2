// Performance monitoring utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.marks = new Map();
  }

  // Start measuring performance
  startMeasure(name) {
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark(`${name}-start`);
      this.marks.set(name, Date.now());
    }
  }

  // End measuring performance
  endMeasure(name) {
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark(`${name}-end`);
      
      try {
        window.performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = window.performance.getEntriesByName(name)[0];
        if (measure) {
          this.metrics.set(name, measure.duration);
          console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
          
          // Clean up marks
          window.performance.clearMarks(`${name}-start`);
          window.performance.clearMarks(`${name}-end`);
          window.performance.clearMeasures(name);
        }
      } catch (error) {
        console.warn('Performance measurement error:', error);
      }
    }
    
    // Fallback timing
    if (this.marks.has(name)) {
      const duration = Date.now() - this.marks.get(name);
      this.metrics.set(name, duration);
      console.log(`⏱️ ${name}: ${duration}ms (fallback)`);
      this.marks.delete(name);
    }
  }

  // Get metric
  getMetric(name) {
    return this.metrics.get(name) || 0;
  }

  // Get all metrics
  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
    this.marks.clear();
  }

  // Log page load performance
  logPageLoad() {
    if ('performance' in window && 'timing' in window.performance) {
      const timing = window.performance.timing;
      const metrics = {
        'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
        'TCP Connection': timing.connectEnd - timing.connectStart,
        'Request': timing.responseStart - timing.requestStart,
        'Response': timing.responseEnd - timing.responseStart,
        'DOM Processing': timing.domComplete - timing.domLoading,
        'Total Load Time': timing.loadEventEnd - timing.navigationStart
      };

      console.log('📊 Page Load Performance:', metrics);
      return metrics;
    }
    return {};
  }

  // Monitor component render
  monitorRender(componentName, callback) {
    this.startMeasure(`${componentName}-render`);
    const result = callback();
    this.endMeasure(`${componentName}-render`);
    return result;
  }

  // Get memory usage (if available)
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };
    }
    return null;
  }

  // Report performance to console
  report() {
    console.log('📊 Performance Report:');
    console.table(this.getAllMetrics());
    
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log('💾 Memory Usage:', memory);
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}

// Export utilities
export const startMeasure = (name) => performanceMonitor.startMeasure(name);
export const endMeasure = (name) => performanceMonitor.endMeasure(name);
export const getMetric = (name) => performanceMonitor.getMetric(name);
export const getAllMetrics = () => performanceMonitor.getAllMetrics();
export const clearMetrics = () => performanceMonitor.clearMetrics();
export const logPageLoad = () => performanceMonitor.logPageLoad();
export const monitorRender = (name, callback) => performanceMonitor.monitorRender(name, callback);
export const getMemoryUsage = () => performanceMonitor.getMemoryUsage();
export const report = () => performanceMonitor.report();

export default performanceMonitor;
