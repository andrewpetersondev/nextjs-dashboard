// src/shared/logging/infra/logging.client.ts
import type { LogLevel } from "@/shared/config/env-schemas";
import type { BaseError } from "@/shared/errors/core/base-error";
import { isBaseError } from "@/shared/errors/core/base-error.factory";
import type { ErrorContext } from "@/shared/errors/core/base-error.types";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import type {
  BaseErrorLogPayload,
  LogBaseErrorOptions,
  LogEventContext,
  LogOperationData,
  SerializedError,
} from "@/shared/logging/core/logger.types";
import { AbstractLogger } from "@/shared/logging/infra/abstract-logger";
import {
  mapSeverityToLogLevel,
  toSafeErrorShape,
} from "@/shared/logging/infra/logging.mappers";

/**
 * Sensitivity-aware structured logger.
 */
export class LoggingClient
  extends AbstractLogger
  implements LoggingClientContract
{
  debug<T>(message: string, data?: T): void {
    this.logAt("debug", message, { log: data });
  }

  info<T>(message: string, data?: T): void {
    this.logAt("info", message, { log: data });
  }

  warn<T>(message: string, data?: T): void {
    this.logAt("warn", message, { log: data });
  }

  error<T>(message: string, data?: T): void {
    this.logAt("error", message, { log: data });
  }

  trace<T>(message: string, data?: T): void {
    this.logAt("trace", message, { log: data });
  }

  /**
   * Create a child logger with additional context.
   */
  withContext(context: string): this {
    const combined = this.loggerContext
      ? `${this.loggerContext}:${context}`
      : context;

    return new LoggingClient(
      combined,
      this.loggerRequestId,
      this.bindings,
    ) as this;
  }

  /**
   * Attach a request ID for correlation (useful in SSR or API contexts).
   */
  withRequest(requestId: string): this {
    return new LoggingClient(
      this.loggerContext,
      requestId,
      this.bindings,
    ) as this;
  }

  /**
   * Create a child logger with persistent structured bound data.
   */
  child(bindings: Record<string, unknown>): this {
    return new LoggingClient(this.loggerContext, this.loggerRequestId, {
      ...this.bindings,
      ...bindings,
    }) as this;
  }

  /**
   * Logs a structured application “operation” event.
   *
   * Designed for high‑level, business‑meaningful events such as
   * “Signup action started”, “Demo user creation failed”, or
   * “Transaction commit”.
   *
   * @param level - Log level to use for the event (e.g. `"info"`, `"error"`).
   * @param message - Human‑readable description of the operation event.
   * @param operationPayload - Structured operation data.
   */
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    operationPayload: LogOperationData<T>,
  ): void {
    const { operationContext, operationIdentifiers, operationName, ...rest } =
      operationPayload;

    // Extract error if it exists to keep it nested
    // This prevents error properties (code, stack, etc.) from polluting the top-level log
    const { error, ...otherData } = rest as Record<string, unknown>;

    // Now safely handled by the mapper regardless of whether it's BaseError or standard Error
    const safeError = error ? toSafeErrorShape(error) : undefined;

    // We construct the payload explicitly to ensure standard fields are present
    // and easy to query in logs.
    const operationLogPayload = {
      log: {
        ...otherData,
        ...(operationIdentifiers ? { identifiers: operationIdentifiers } : {}),
        operationName,
      },
      ...(safeError ? { error: safeError } : {}), // Keep error nested
    };

    const target = operationContext ? this.withContext(operationContext) : this;
    target.logAt(level, message, operationLogPayload);
  }

  /**
   * Log a BaseError with structured, sanitized output.
   */
  logBaseError(error: BaseError, options?: LogBaseErrorOptions): void {
    const { levelOverride, loggingContext, message } = options ?? {};

    const level = levelOverride ?? mapSeverityToLogLevel(error.severity);

    const baseLogPayload = this.buildErrorPayload(error);

    const mergedLogPayload = {
      error: baseLogPayload,
      ...(loggingContext ? { log: loggingContext } : {}),
    };

    this.logAt(level, message ?? error.message, mergedLogPayload);
  }

  /**
   * Logs an unknown error value with rich, sanitized details.
   * @param message - Log message describing the failure context
   * @param error - The error or thrown value to log
   * @param loggingContext - Optional operational metadata attached at log-time
   *   (e.g. requestId, hostname, traceId)
   */
  errorWithDetails(
    message: string,
    error: unknown,
    loggingContext?: LogEventContext,
  ): void {
    if (!isBaseError(error)) {
      // Pass the raw error through. AbstractLogger will handle basic serialization
      // if it's an Error object, but we won't force redaction or shape-shifting here.
      const safeError = toSafeErrorShape(error);

      const errorPayload = {
        error: safeError,
        ...(loggingContext ? { log: loggingContext } : {}),
      };

      this.logAt("error", message, errorPayload);
      return;
    }
    this.logBaseError(error, {
      levelOverride: "error",
      loggingContext,
      message,
    });
  }

  private buildErrorPayload(error: BaseError): BaseErrorLogPayload {
    const baseJson = error.toJson();
    const diagnosticId = this.extractDiagnosticId(error.context);

    const hasValidationErrors =
      (baseJson.formErrors && baseJson.formErrors.length > 0) ||
      (baseJson.fieldErrors && Object.keys(baseJson.fieldErrors).length > 0);

    return {
      code: baseJson.code,
      description: baseJson.description,
      diagnosticId,
      layer: baseJson.layer,
      metadata: baseJson.metadata,
      ...(baseJson.fieldErrors && { fieldErrors: baseJson.fieldErrors }),
      ...(baseJson.formErrors && { formErrors: baseJson.formErrors }),
      message: baseJson.message,
      retryable: baseJson.retryable,
      severity: baseJson.severity,
      ...(hasValidationErrors && { validationErrorPresent: true }),
      cause:
        error.cause instanceof Error
          ? (toSafeErrorShape(error.cause) as SerializedError)
          : undefined,
      ...(error.originalCause !== error.cause && {
        originalCauseRedacted: true,
        originalCauseType: typeof error.originalCause,
      }),
      stack: error.stack,
    };
  }

  private extractDiagnosticId(
    context: ErrorContext | undefined,
  ): string | undefined {
    if (!context) {
      return;
    }

    const ctx = context as Record<string, unknown>;
    const id = ctx.diagnosticId;

    return typeof id === "string" ? id : undefined;
  }
}

export const logger = new LoggingClient();
