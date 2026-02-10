import { isPublicProd } from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import type { LogEntry } from "@/shared/logging/core/logger.types";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import {
  consoleMethod,
  currentLogLevelPriority,
  logLevelPriority,
} from "@/shared/logging/infrastructure/logging.levels";
import { toSafeErrorShape } from "@/shared/logging/infrastructure/logging.mappers";
import { createRedactor } from "@/shared/logging/redaction/redaction";
import {
  DEFAULT_MASK,
  DEFAULT_MAX_DEPTH,
} from "@/shared/logging/redaction/redaction.constants";

/**
 * Get process ID if available (server-side only).
 * Returns undefined in browser environments.
 */
const processId: number | undefined = getProcessId();

/**
 * Static context applied to all logs from this process.
 * Useful for version, environment, and service identifiers.
 */
let processMetadata: Record<string, unknown> = {};

/**
 * Redactor for log payloads, built on the core redaction system.
 * Configured with strict defaults to avoid drift.
 */
// biome-ignore lint/nursery/useExplicitType: fix
const redactLogData = createRedactor({
  extraKeys: [],
  mask: DEFAULT_MASK,
  maxDepth: DEFAULT_MAX_DEPTH,
  partialMask: true,
});

export abstract class AbstractLogger {
  protected readonly bindings: Record<string, unknown>;
  protected readonly loggerContext?: string;
  protected readonly loggerRequestId?: string;

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

  abstract withContext(context: string): LoggingClientContract;

  abstract withRequest(requestId: string): LoggingClientContract;

  abstract child(bindings: Record<string, unknown>): LoggingClientContract;

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
    data: T | undefined,
  ): LogEntry<T> {
    // Minimal safety if 'data' itself is an Error object
    // (e.g., logger.error("msg", new Error())).
    let safeData = data;

    if (safeData instanceof Error) {
      safeData = toSafeErrorShape(safeData) as T;
    }

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
    if (isPublicProd()) {
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

    if (entry.data !== undefined && entry.metadata !== undefined) {
      return [
        head,
        entry.message,
        { data: entry.data, metadata: entry.metadata },
      ];
    }

    if (entry.data !== undefined) {
      return [head, entry.message, entry.data];
    }

    if (entry.metadata !== undefined) {
      return [head, entry.message, { metadata: entry.metadata }];
    }

    return [head, entry.message];
  }

  protected output(entry: LogEntry): void {
    consoleMethod[entry.logLevel](...this.format(entry));
  }
}
