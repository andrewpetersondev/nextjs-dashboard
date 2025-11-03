// src/server/auth/application/actions/utils/performance-tracker.ts
export class PerformanceTracker {
  private readonly startTime = performance.now();
  private readonly metrics: Record<string, number> = {};

  async measure<T>(phase: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    this.metrics[phase] = performance.now() - start;
    return result;
  }

  getMetrics() {
    return {
      ...this.metrics,
      total: this.getTotalDuration(),
    };
  }

  getTotalDuration() {
    return performance.now() - this.startTime;
  }
}
