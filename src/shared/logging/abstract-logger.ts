// src/shared/logging/abstract-logger
import type { LogLevel } from "@/shared/config/env-schemas";

// TODO: THIS IS A CONCEPTUAL OUTLINE. IN NO WAY IS THIS ACCURATE OR COMPLETE FOR MY ACTUAL APPLICATION
export abstract class BaseLogger {
  protected abstract output(entry: any): void;

  protected shouldLog(level: LogLevel): boolean {
    return true; // Replace with real threshold logic
  }

  protected createEntry(level: LogLevel, message: string, data?: unknown) {
    return {
      data,
      level,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  protected logAt<T>(level: LogLevel, message: string, data?: T): void {
    if (!this.shouldLog(level)) {
      console.log("[Logger] logAt skipped", {
        level,
        message,
        reason: "below-threshold",
      });
      return;
    }

    console.log("[Logger] logAt emit", { level, message });

    const entry = this.createEntry(level, message, data);
    this.output(entry);
  }
}
