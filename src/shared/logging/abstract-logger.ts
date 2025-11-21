// src/shared/logging/abstract-logger
import { getRuntimeNodeEnv } from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import { createRedactor } from "@/shared/errors/core/redaction/redaction";
import {
  consoleMethod,
  currentLogLevelPriority,
  logLevelPriority,
} from "@/shared/logging/logger.levels";
import type { LogEntry } from "@/shared/logging/logger.types";
import { toSafeErrorShape } from "@/shared/logging/shared-logger.mappers";

const processId = getProcessId();

/**
 * Static context applied to all logs from this process.
 * Useful for version, environment, and service identifiers.
 */
let processMetadata: Record<string, unknown> = {};

/**
 * Shared redactor for log payloads, built on the core redaction system.
 *
 * - Uses DEFAULT_SENSITIVE_KEYS and redaction configuration.
 * - Guards against circular references per invocation.
 */
const redactLogData = createRedactor();

export abstract class AbstractLogger {
  protected readonly loggerContext?: string;
  protected readonly loggerRequestId?: string;

  constructor(context?: string, requestId?: string) {
    this.loggerContext = context;
    this.loggerRequestId = requestId;
  }

  /**
   * Configure global context for all Logger instances.
   * Call this once at application bootstrap.
   */
  static setGlobalContext(context: Record<string, unknown>): void {
    processMetadata = { ...processMetadata, ...context };
  }

  abstract withContext(context: string): AbstractLogger;
  abstract withRequest(requestId: string): AbstractLogger;

  debug<T>(message: string, data?: T): void {
    this.logAt("debug", message, data);
  }

  error<T>(message: string, data?: T): void {
    this.logAt("error", message, data);
  }

  info<T>(message: string, data?: T): void {
    this.logAt("info", message, data);
  }

  trace<T>(message: string, data?: T): void {
    this.logAt("trace", message, data);
  }

  warn<T>(message: string, data?: T): void {
    this.logAt("warn", message, data);
  }

  protected shouldLog(level: LogLevel): boolean {
    return logLevelPriority[level] <= currentLogLevelPriority();
  }

  protected createEntry<T>(
    level: LogLevel,
    message: string,
    data?: T,
  ): LogEntry<T> {
    let safeData = data;
    if (safeData instanceof Error) {
      // @ts-expect-error - transforming type for serialization purposes
      safeData = toSafeErrorShape(safeData);
    }

    console.log("[Logger] createEntry", {
      dataIncluded: safeData !== undefined,
      level,
      message,
    });

    const entry: LogEntry<T> = {
      data: safeData !== undefined ? (redactLogData(safeData) as T) : undefined,
      loggerContext: this.loggerContext || undefined,
      logLevel: level,
      message,
      pid: processId,
      requestId: this.loggerRequestId || undefined,
      timestamp: new Date().toISOString(),
      ...(Object.keys(processMetadata).length > 0
        ? { metadata: processMetadata }
        : {}),
    };
    return entry;
  }

  protected format(entry: LogEntry): unknown[] {
    if (getRuntimeNodeEnv() === "production") {
      return [JSON.stringify(entry)];
    }
    const prefix: string[] = [entry.timestamp];
    if (entry.requestId) {
      prefix.push(`[req:${entry.requestId}]`);
    }
    if (entry.loggerContext) {
      prefix.push(`[${entry.loggerContext}]`);
    }
    const head = prefix.join(" ");
    return entry.data !== undefined
      ? [head, entry.message, entry.data]
      : [head, entry.message];
  }

  protected output(entry: LogEntry): void {
    consoleMethod[entry.logLevel](...this.format(entry));
  }

  logAt<T>(level: LogLevel, message: string, data?: T): void {
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
