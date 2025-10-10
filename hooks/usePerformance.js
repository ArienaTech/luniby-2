import { useEffect, useRef } from 'react';
import logger from '../lib/logger';

// Custom hook for performance monitoring
export const usePerformance = (componentName) => {
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = performance.now();
    logger.debug(`⏱️ ${componentName} - Component mounted, starting performance measurement`);

    return () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        logger.debug(`⏱️ ${componentName} - Component unmounted after ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  const measureOperation = (operationName, operation) => {
    return async (...args) => {
      const start = performance.now();
      logger.debug(`⏱️ ${componentName} - Starting ${operationName}`);
      
      try {
        const result = await operation(...args);
        const duration = performance.now() - start;
        logger.debug(`⏱️ ${componentName} - ${operationName} completed in ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        logger.warn(`⏱️ ${componentName} - ${operationName} failed after ${duration.toFixed(2)}ms`);
        throw error;
      }
    };
  };

  const markTime = (label) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      logger.debug(`⏱️ ${componentName} - ${label}: ${duration.toFixed(2)}ms from mount`);
    }
  };

  return { measureOperation, markTime };
};

// Hook for measuring network requests
export const useNetworkPerformance = () => {
  const measureRequest = async (requestName, requestFn) => {
    const start = performance.now();
    logger.debug(`🌐 Starting ${requestName}`);
    
    try {
      const result = await requestFn();
      const duration = performance.now() - start;
      logger.debug(`🌐 ${requestName} completed in ${duration.toFixed(2)}ms`);
      
      // Log slow requests
      if (duration > 1000) {
        logger.warn(`🐌 Slow request detected: ${requestName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`🌐 ${requestName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };

  return { measureRequest };
};

export default usePerformance;