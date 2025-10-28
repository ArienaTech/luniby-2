import React, { useState, useEffect } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

const PerformanceSummary = () => {
  const [summary, setSummary] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateSummary = () => {
      const newSummary = performanceMonitor.getSummary();
      setSummary(newSummary);
    };

    // Update every 5 seconds
    const interval = setInterval(updateSummary, 5000);
    updateSummary(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development' || !summary) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm hover:bg-blue-600 transition-colors"
      >
        📊 Performance
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Performance Monitor</h3>
            <button
              onClick={() => {
                performanceMonitor.clear();
                setSummary(null);
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Clear
            </button>
          </div>
          
          {summary.memory && (
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Memory Usage</h4>
              <div className="text-xs text-gray-600">
                <div>Used: {summary.memory.used}MB</div>
                <div>Total: {summary.memory.total}MB</div>
                <div>Limit: {summary.memory.limit}MB</div>
              </div>
            </div>
          )}
          
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Operations</h4>
            <div className="text-xs text-gray-600">
              <div>Total: {summary.totalOperations}</div>
              <div>Average: {summary.averageTime?.toFixed(2)}ms</div>
            </div>
          </div>
          
          {summary.slowestOperations.length > 0 && (
            <div className="p-2 bg-gray-50 rounded">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Slowest Operations</h4>
              <div className="space-y-1">
                {summary.slowestOperations.map((op, index) => (
                  <div key={index} className="text-xs text-gray-600 flex justify-between">
                    <span className="truncate mr-2">{op.operation}</span>
                    <span className="text-red-500 font-mono">
                      {op.duration.toFixed(2)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceSummary;