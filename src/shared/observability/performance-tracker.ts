/**
 * Utility for measuring durations of asynchronous phases and aggregating metrics.
 *
 * Collects per-phase durations (in milliseconds) and optional error flags, and exposes
 * helpers to read simplified metrics, last recorded durations, total elapsed time,
 * and to reset recorded metrics.
 */
export class PerformanceTracker {
  /**
   * Timestamp (in milliseconds) captured at instantiation to compute total elapsed time.
   * @private
   */
  private readonly startTime = performance.now();

  /**
   * Stored metrics keyed by phase name.
   * Each entry contains:
   * - `duration`: measured time in milliseconds,
   * - `error`: optional flag set to `true` if the measured function threw.
   * @private
   */
  private readonly metrics: Record<
    string,
    { duration: number; error?: boolean }
  > = {};

  /**
   * Measure execution time for an asynchronous phase and record it.
   *
   * The provided function `fn` is awaited; on success the duration is recorded,
   * on error the duration is recorded and an `error` flag is set before re-throwing.
   *
   * @param phase - Logical name for the measured phase.
   * @param fn - Asynchronous function to execute and measure.
   * @returns The resolved value from `fn`.
   * @throws Re-throws any error thrown by `fn` after recording the metric.
   */
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

  /**
   * Measure execution time for a synchronous phase and record it.
   *
   * The provided function `fn` is executed synchronously; on success the duration is recorded,
   * on error the duration is recorded and an `error` flag is set before re-throwing.
   *
   * @param phase - Logical name for the measured phase.
   * @param fn - Synchronous function to execute and measure.
   * @returns The returned value from `fn`.
   * @throws Re-throws any error thrown by `fn` after recording the metric.
   */
  measureSync<T>(phase: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
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

  /**
   * Return a simplified metrics object suitable for logging or telemetry.
   *
   * Each recorded phase maps to its duration (milliseconds). If a phase previously
   * errored, an additional key with suffix `_error` will be present and set to `true`.
   * The returned object also includes a `total` key representing elapsed time since
   * this tracker was created.
   *
   * @returns Record of metric keys to numbers or booleans.
   */
  // biome-ignore lint/nursery/useExplicitType: fix
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

  /**
   * Get all recorded timings for all phases.
   *
   * @returns Record mapping phase names to their durations in milliseconds.
   */
  getAllTimings(): Record<string, number> {
    return Object.entries(this.metrics).reduce(
      (acc, [key, value]) => {
        acc[key] = value.duration;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get the last recorded duration for a specific phase.
   *
   * @param phase - Name of the phase.
   * @returns Duration in milliseconds, or `0` if the phase has no recorded metric.
   */
  getLastDuration(phase: string): number {
    return this.metrics[phase]?.duration ?? 0;
  }

  /**
   * Compute total elapsed time in milliseconds since this tracker was instantiated.
   *
   * @returns Total duration in milliseconds.
   */
  getTotalDuration(): number {
    return performance.now() - this.startTime;
  }
}
