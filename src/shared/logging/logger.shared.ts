// src/shared/logging/logger.shared.ts
/** biome-ignore-all lint/correctness/noProcessGlobal: <explanation> */
/** biome-ignore-all lint/style/noProcessEnv: <explanation> */
import { LOG_LEVEL_TUPLE, type LogLevel } from "@/shared/config/env-schemas";

/**
 * Structured log entry format for consistency and JSON parsing.
 */
export interface LogEntry<T = unknown> {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  data?: T;
}

/**
 * Priority by **risk of exposing sensitive information**.
 *
 * Higher number = greater exposure risk.
 *
 * @property trace - Highest risk (contains most detailed internal data)
 * @property debug - High risk (technical details, stack traces)
 * @property info  - Moderate risk (operational events)
 * @property warn  - Low risk (recoverable issues)
 * @property error - Lowest risk (usually safe to expose)
 */
const levelPriority = {
  debug: 40,
  error: 10,
  info: 30,
  trace: 50,
  warn: 20,
} as const satisfies Record<LogLevel, number>;

/**
 * Derive current log level from environment (default: 'info').
 */
const rawEnvLevel = process.env.NEXT_PUBLIC_LOG_LEVEL ?? "info";

function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVEL_TUPLE as readonly string[]).includes(value);
}

const envLevel = isLogLevel(rawEnvLevel) ? rawEnvLevel : "info";
const currentLevel = levelPriority[envLevel];

/**
 * Recursively sanitize objects to redact sensitive fields.
 */
function sanitize(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (data && typeof data === "object") {
    const redactedKeys = [
      "password",
      "token",
      "secret",
      "authorization",
      "apiKey",
      "key",
    ];
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        k,
        redactedKeys.some((rk) => k.toLowerCase().includes(rk))
          ? "[REDACTED]"
          : sanitize(v),
      ]),
    );
  }
  return data;
}

/**
 * Sensitivity-aware structured logger.
 */
export class Logger {
  private readonly context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] <= currentLevel;
  }

  private createEntry<T>(
    level: LogLevel,
    message: string,
    data?: T,
  ): LogEntry<T> {
    const entry: LogEntry<T> = {
      context: this.context,
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      // sanitize preserves structure for logging; cast back to T for the entry
      entry.data = sanitize(data) as T;
    }

    return entry;
  }

  private format(entry: LogEntry): unknown[] {
    const { timestamp, context, message, data } = entry;
    const prefix = context ? `[${context}]` : "";
    if (process.env.NODE_ENV === "production") {
      return [JSON.stringify(entry)];
    }
    return [timestamp, prefix, message, data].filter(Boolean);
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.format(entry);
    const consoleMethod: Record<LogLevel, (...args: unknown[]) => void> = {
      debug: console.debug,
      error: console.error,
      info: console.info,
      trace: console.trace,
      warn: console.warn,
    };
    consoleMethod[entry.level](...formatted);
  }

  trace<T>(message: string, data?: T): void {
    this.output(this.createEntry("trace", message, data));
  }

  debug<T>(message: string, data?: T): void {
    this.output(this.createEntry("debug", message, data));
  }

  info<T>(message: string, data?: T): void {
    this.output(this.createEntry("info", message, data));
  }

  warn<T>(message: string, data?: T): void {
    this.output(this.createEntry("warn", message, data));
  }

  error<T>(message: string, data?: T): void {
    this.output(this.createEntry("error", message, data));
  }

  withContext(context: string): Logger {
    const combined = this.context ? `${this.context}:${context}` : context;
    return new Logger(combined);
  }
}

export const logger = new Logger();
