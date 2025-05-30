import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { MemoryCache } from './cache';

// Create a global cache instance for performance-critical data
const performanceCache = new MemoryCache(5 * 60 * 1000); // 5 minute cache

export const reportWebVitals = (onPerfEntry?: (metric: any) => void): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// Enhanced performance marks and measures with automatic cleanup
// Performance marks and measures
export const markAndMeasure = (markName: string, measureName: string) => {
  // Clear old marks to prevent memory leaks
  performance.clearMarks(markName);
  performance.clearMeasures(measureName);
  
  performance.mark(markName);
  performance.measure(measureName, markName);
  
  // Return the measurement duration
  const entries = performance.getEntriesByName(measureName);
  return entries[entries.length - 1]?.duration || 0;
};

// Long task monitoring
export const observeLongTasks = (callback: (duration: number) => void) => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Only report tasks that took longer than 100ms
      if (entry.duration > 100) {
        callback(entry.duration || 0);
      }
    }
  });

  observer.observe({ entryTypes: ['longtask'] });
  return observer;
};

// Resource timing monitoring
export const observeResourceTiming = (callback: (entry: PerformanceResourceTiming) => void) => {
  const observer = new PerformanceObserver((list) => {
    // Filter out non-critical resources
    list.getEntries()
      .filter(entry => {
        const url = entry.name.toLowerCase();
        return url.includes('critical') || 
               url.includes('main') || 
               url.includes('vendor');
      })
      .forEach(callback);
  });

  observer.observe({ entryTypes: ['resource'] });
  return observer;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const usage = {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
    };
    
    // Alert if memory usage is high (>90% of limit)
    if (usage.usedJSHeapSize > usage.jsHeapSizeLimit * 0.9) {
      console.warn('High memory usage detected');
    }
    
    return usage;
  }
  return null;
};

// Cache performance critical data
export const cacheData = <T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
  performanceCache.set(key, data);
};

export const getCachedData = <T>(key: string): T | null => {
  return performanceCache.get(key);
};

// Debounce function for performance-intensive operations
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
    };
  };
};