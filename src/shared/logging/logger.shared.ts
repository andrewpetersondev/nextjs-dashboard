// src/shared/logging/logger.shared.ts

export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LogEntry<T = unknown> {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  data?: T;
}

const levelPriority = {
  debug: 20,
  error: 50,
  info: 30,
  trace: 10,
  warn: 40,
} as const satisfies Record<LogLevel, number>;

// Safely determine log level from environment
// biome-ignore lint/style/noProcessEnv: environment check
// biome-ignore lint/correctness/noProcessGlobal: environment check
const rawEnvLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL ?? "").toLowerCase();

function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVELS as readonly string[]).includes(value);
}

const envLevel = isLogLevel(rawEnvLevel) ? rawEnvLevel : undefined;
const currentLevel = envLevel ? levelPriority[envLevel] : levelPriority.info;

export class Logger {
  private readonly context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return currentLevel <= levelPriority[level];
  }

  private createEntry<T>(
    level: LogLevel,
    message: string,
    data?: T,
  ): LogEntry<T> {
    return {
      context: this.context,
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data !== undefined ? { data } : {}),
    };
  }

  private format(entry: LogEntry): unknown[] {
    const { timestamp, context, message, data } = entry;
    const prefix = context ? `[${context}]` : "";
    return [timestamp, prefix, message, data].filter(Boolean);
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const args = this.format(entry);

    const consoleMethod: Record<LogLevel, (...args: unknown[]) => void> = {
      debug: console.debug,
      error: console.error,
      info: console.info,
      trace: console.trace,
      warn: console.warn,
    };

    (consoleMethod[entry.level] ?? console.log)(...args);
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
