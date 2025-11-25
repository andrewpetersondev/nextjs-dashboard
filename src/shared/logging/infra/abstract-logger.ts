// src/shared/logging/infra/abstract-logger.ts

import { isPublicProd } from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import type { LogEntry } from "@/shared/logging/core/logger.types";
import {
  consoleMethod,
  currentLogLevelPriority,
  logLevelPriority,
} from "@/shared/logging/infra/logging.levels";
import { toSafeErrorShape } from "@/shared/logging/infra/logging.mappers";
import { createRedactor } from "@/shared/logging/redaction/redaction";

/**
 * Get process ID if available (server-side only).
 * Returns undefined in browser environments.
 */
const processId = getProcessId();

/**
 * Static context applied to all logs from this process.
 * Useful for version, environment, and service identifiers.
 */
let processMetadata: Record<string, unknown> = {};

/**
 * Redactor for log payloads, built on the core redaction system.
 */
const redactLogData = createRedactor();

export abstract class AbstractLogger {
  protected readonly loggerContext?: string;
  protected readonly loggerRequestId?: string;
  protected readonly bindings: Record<string, unknown>;

  constructor(
    context?: string,
    requestId?: string,
    bindings: Record<string, unknown> = {},
  ) {
    this.loggerContext = context;
    this.loggerRequestId = requestId;
    this.bindings = bindings;
  }

  /**
   * Configure global context for all Logger instances.
   * Call this once at application bootstrap.
   */
  static setGlobalContext(context: Record<string, unknown>): void {
    processMetadata = { ...processMetadata, ...context };
  }

  abstract withContext(context: string): this;

  abstract withRequest(requestId: string): this;

  abstract child(bindings: Record<string, unknown>): this;

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

  logAt<T>(level: LogLevel, message: string, data?: T): void {
    if (!this.shouldLog(level)) {
      return;
    }
    const entry = this.createEntry(level, message, data);
    this.output(entry);
  }

  protected shouldLog(level: LogLevel): boolean {
    return logLevelPriority[level] <= currentLogLevelPriority();
  }

  protected createEntry<T>(
    level: LogLevel,
    message: string,
    data?: T,
  ): LogEntry<T> {
    // We are now trusting the caller (LoggingClient) to have prepared 'data'.
    // We only apply minimal safety if 'data' itself IS an Error object,
    // which can happen if someone calls logger.error("msg", new Error()).
    let safeData = data;

    if (safeData instanceof Error) {
      safeData = toSafeErrorShape(safeData) as T;
    }

    // Redaction is temporarily disabled/bypassed for clarity per instruction,
    // or we can leave it if it's just for PII. Assuming we keep basic PII redaction
    // but stop over-sanitizing structure.
    const redactedData =
      safeData !== undefined ? (redactLogData(safeData) as T) : undefined;

    const metadata = { ...processMetadata, ...this.bindings };
    const hasMetadata = Object.keys(metadata).length > 0;

    const entry: LogEntry<T> = {
      data: redactedData,
      loggerContext: this.loggerContext || undefined,
      logLevel: level,
      message,
      pid: processId,
      requestId: this.loggerRequestId || undefined,
      timestamp: new Date().toISOString(),
      ...(hasMetadata ? { metadata } : {}),
    };
    return entry;
  }

  protected format(entry: LogEntry): unknown[] {
    // Use centralized production detection from config
    if (isPublicProd()) {
      return [JSON.stringify(entry)];
    }

    // Development formatting: human-readable console output
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
}
