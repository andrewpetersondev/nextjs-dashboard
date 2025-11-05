// src/server/auth/application/actions/utils/performance-tracker.ts
import { logger } from "@/shared/logging/logger.shared";

export class PerformanceTracker {
  private readonly startTime = performance.now();
  private readonly metrics: Record<
    string,
    { duration: number; error?: boolean }
  > = {};

  async measure<T>(phase: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.metrics[phase] = { duration: performance.now() - start };
      return result;
    } catch (error) {
      this.metrics[phase] = {
        duration: performance.now() - start,
        error: true,
      };
      throw error; // Re-throw to preserve original behavior
    }
  }

  getMetrics() {
    const simplified = Object.entries(this.metrics).reduce(
      (acc, [key, value]) => {
        acc[key] = value.duration;
        if (value.error) {
          acc[`${key}_error`] = true;
        }
        return acc;
      },
      {} as Record<string, number | boolean>,
    );

    return {
      ...simplified,
      total: this.getTotalDuration(),
    };
  }

  getLastDuration(phase: string): number {
    return this.metrics[phase]?.duration ?? 0;
  }

  getTotalDuration() {
    return performance.now() - this.startTime;
  }

  reset() {
    const keys = Object.keys(this.metrics);
    const count = keys.length;
    for (const key of keys) {
      delete this.metrics[key];
    }
    logger.debug("PerformanceTracker reset", { metricCount: count });
  }
}
