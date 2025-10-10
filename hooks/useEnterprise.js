import { useState, useEffect } from 'react';
import { MonitoringUtils } from '../lib/monitoring';
import { SecurityUtils } from '../lib/security';

// Custom hook for enterprise features
export const useEnterprise = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rateLimitStatus, setRateLimitStatus] = useState(null);

  useEffect(() => {
    const loadSystemHealth = async () => {
      try {
        const health = await MonitoringUtils.getSystemHealth();
        setSystemHealth(health);
      } catch (error) {
        console.error('Failed to load system health:', error);
        MonitoringUtils.logError(error, { context: 'useEnterprise hook' });
      } finally {
        setLoading(false);
      }
    };

    loadSystemHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = async (action) => {
    const status = await SecurityUtils.checkRateLimit(action);
    setRateLimitStatus(status);
    return status;
  };

  const checkRole = async (requiredRole) => {
    return await SecurityUtils.checkRole(requiredRole);
  };

  return {
    // Monitoring
    systemHealth,
    loading,
    logError: MonitoringUtils.logError,
    recordMetric: MonitoringUtils.recordMetric,
    exportDiagnostics: MonitoringUtils.exportDiagnostics,
    
    // Security
    rateLimitStatus,
    checkRateLimit,
    checkRole,
    sanitizeInput: SecurityUtils.sanitizeInput,
    validateFileUpload: SecurityUtils.validateFileUpload
  };
};

export default useEnterprise;