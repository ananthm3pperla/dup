
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Performance monitoring service for tracking app performance
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 500;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log performance issues
    if (this.isSlowMetric(name, value)) {
      console.warn(`Performance warning: ${name} took ${value}ms`, metadata);
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Start a performance timer
   */
  startTimer(name: string): () => void {
    const startTime = performance.now();
    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, metadata);
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; average: number; min: number; max: number }> {
    const summary: Record<string, { count: number; average: number; min: number; max: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          average: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const stats = summary[metric.name];
      stats.count++;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.average = (stats.average * (stats.count - 1) + metric.value) / stats.count;
    });

    return summary;
  }

  private isSlowMetric(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      'api_request': 1000, // 1 second
      'component_render': 16, // 16ms for 60fps
      'database_query': 500, // 500ms
      'file_upload': 5000, // 5 seconds
    };

    return value > (thresholds[name] || 1000);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measureAsync(metricName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
