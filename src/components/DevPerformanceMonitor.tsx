// Development performance monitoring
'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
}

export default function DevPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

      setMetrics({
        pageLoadTime: Math.round(pageLoadTime),
        apiResponseTime: 0, // Will be updated by API calls
        renderTime: Math.round(renderTime),
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowMetrics(!showMetrics)}
        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-mono hover:bg-blue-600 transition-colors"
      >
        ⚡ Performance
      </button>
      
      {showMetrics && (
        <div className="absolute bottom-10 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-lg min-w-48 font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Performance Metrics</span>
            <button
              onClick={() => setShowMetrics(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Page Load:</span>
              <span className={metrics.pageLoadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
                {metrics.pageLoadTime}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Render Time:</span>
              <span className={metrics.renderTime > 1000 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.renderTime}ms
              </span>
            </div>
            
            <div className="border-t border-gray-700 pt-1 mt-2">
              <div className="text-gray-400 text-xs">
                {metrics.pageLoadTime > 3000 ? '🐌 Slow' : 
                 metrics.pageLoadTime > 1500 ? '⚠️ OK' : '🚀 Fast'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
