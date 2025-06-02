interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isDevelopment = import.meta.env.DEV;

  startTimer(
    name: string,
  ): (result?: { success: boolean; error?: string }) => void {
    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
    });

    return (result = { success: true }) => {
      const metric = this.metrics.get(name);
      if (metric) {
        const endTime = performance.now();
        metric.endTime = endTime;
        metric.duration = endTime - startTime;
        metric.success = result.success;
        metric.error = result.error;

        if (this.isDevelopment) {
          console.log(
            `[PERFORMANCE] ${name}: ${metric.duration.toFixed(2)}ms`,
            {
              success: metric.success,
              error: metric.error,
            },
          );
        }
      }
    };
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
