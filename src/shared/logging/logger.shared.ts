// src/shared/logging/logger.shared.ts
import type { LogLevel } from "@/shared/config/env-schemas";
import type { BaseError } from "@/shared/errors/base-error";
import { isBaseError } from "@/shared/errors/base-error.factory";
import type { ErrorContext } from "@/shared/errors/base-error.types";
import { AbstractLogger } from "@/shared/logging/abstract-logger";
import type { LoggingClientContract } from "@/shared/logging/logger.contracts";
import type {
  BaseErrorLogPayload,
  LogBaseErrorOptions,
  LogEventContext,
  LogOperationData,
  SerializedErrorCause,
} from "@/shared/logging/logger.types";
import {
  mapSeverityToLogLevel,
  toSafeErrorShape,
} from "@/shared/logging/shared-logger.mappers";

/**
 * Sensitivity-aware structured logger.
 *
 * Key Concepts:
 *
 * **Error Context vs Logging Context**
 * - ErrorContext: Diagnostic data frozen at error creation (part of the error)
 * - LoggingContext: Operational metadata attached at log-time (part of the log entry)
 *
 * When logging errors:
 * 1. Error diagnostic data (context) is embedded in BaseError
 * 2. Logging metadata (loggingContext) is merged into the log entry
 * 3. Both appear in the final log output but serve different purposes
 *
 * @example
 * ```typescript
 * // Error constructed with diagnostic context
 * const error = new BaseError('USER_NOT_FOUND', {
 *   context: { userId: '123', operation: 'getUser' }
 * });
 *
 * // Logged with operational metadata
 * logger.logBaseError(error, {
 *   loggingContext: { requestId: 'req-456', hostname: 'api-1' }
 * });
 *
 * // Final log contains both:
 * // - error.context: { userId: '123', operation: 'getUser' }
 * // - requestId: 'req-456', hostname: 'api-1'
 */
export class LoggingClient
  extends AbstractLogger
  implements LoggingClientContract
{
  // TODO: refactor names in logger to make this obsolete
  private static readonly logMetadataConflictKeys = new Set([
    "context",
    "operation",
  ]);

  /**
   * Create a child logger with additional context.
   */
  withContext(context: string): this {
    const combined = this.loggerContext
      ? `${this.loggerContext}:${context}`
      : context;

    return new LoggingClient(combined, this.loggerRequestId) as this;
  }

  /**
   * Attach a request ID for correlation (useful in SSR or API contexts).
   */
  withRequest(requestId: string): this {
    return new LoggingClient(this.loggerContext, requestId) as this;
  }

  /**
   * Logs a structured application “operation” event.
   *
   * Designed for high‑level, business‑meaningful events such as
   * “Signup action started”, “Demo user creation failed”, or
   * “Transaction commit”.
   *
   * Behavior:
   * - Uses `operationPayload.operationContext` (if provided) to derive a child logger via
   *   {@link LoggingClient.withContext}, so the operation is tagged with a
   *   stable logical context (e.g. `auth:application.action.signup`).
   * - Reads `operationPayload.operationName` as the canonical operation name
   *   (e.g. `"signup"`, `"demoUser"`, `"withTransaction"`).
   * - Flattens `operationPayload.operationIdentifiers` into the log payload so that key
   *   identifiers (e.g. `userId`, `role`, `ip`) are top‑level fields.
   * - Runtime guards drop conflicting keys such as `context` or `operation`
   *   to keep them disjoint from BaseError payload fields.
   *
   * This method does **not** know about {@link BaseError}. It is meant for
   * domain / operation telemetry, not for rich error logging. Use
   * {@link LoggingClient.errorWithDetails} or {@link LoggingClient.logBaseError} for
   * full error payloads.
   *
   * @typeParam T - Additional payload shape for the operation.
   *
   * @param level - Log level to use for the event (e.g. `"info"`, `"error"`).
   * @param message - Human‑readable description of the operation event.
   * @param operationPayload - Structured operation data. The following keys have
   *   special meaning:
   *   - `operationContext?`: Logical log context; when present, it is applied via
   *     {@link LoggingClient.withContext} before logging.
   *   - `operationName`: Canonical operation name (e.g. `"signup"`).
   *   - `operationIdentifiers?`: Stable identifiers to flatten into the payload
   *     (user IDs, roles, IPs, etc.).
   *   - Any other keys (e.g. `details`, metrics, status flags) are logged
   *     as part of the operation payload after conflicting keys are filtered.
   *
   * @example
   * ```ts
   * // Action‑layer operation logging
   * actionLogger.operation("info", "Signup action started", {
   *   details: { userAgent },
   *   operationContext: "auth:application.action.signup",
   *   operationIdentifiers: { ip, userId },
   *   operationName: "signup",
   * });
   */
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    operationPayload: LogOperationData<T>,
  ): void {
    const { operationContext, operationIdentifiers, operationName, ...rest } =
      operationPayload;

    const safeRest = { ...rest } as Record<string, unknown>;

    if ("error" in safeRest && safeRest.error instanceof Error) {
      safeRest.error = toSafeErrorShape(safeRest.error);
    }

    const sanitizedOperationDetails = this.removeConflictingKeys(safeRest);
    const sanitizedIdentifiers = this.removeConflictingKeys(
      operationIdentifiers as Record<string, unknown> | undefined,
    );

    const operationLogPayload = this.composeLogPayload(
      sanitizedOperationDetails,
      sanitizedIdentifiers,
      { operationName },
    );

    console.log("[Logger] operation payload", {
      level,
      message,
      operationContext,
      operationName,
    });

    const target = operationContext ? this.withContext(operationContext) : this;
    target.logAt(level, message, operationLogPayload);
  }

  /**
   * Log a BaseError with structured, sanitized output.
   *
   * @remarks
   * - By default, uses `toJson()` which excludes stack/cause for safety
   * - Set `detailed: true` to include stack traces and cause chain
   * - Automatically extracts `diagnosticId` from error context when present
   * - Maps error severity to appropriate log level
   * - `loggingContext` is merged into the log entry data, not the error payload
   * - All payloads are immutably constructed
   *
   * @example
   * ```typescript
   * logger.logBaseError(error);
   * logger.logBaseError(error, {
   *   detailed: true,
   *   loggingContext: { requestId: 'abc', hostname: 'api-1' }
   * });
   *
   */
  logBaseError(error: BaseError, options?: LogBaseErrorOptions): void {
    const { detailed, levelOverride, loggingContext, message } = options ?? {};

    const level = levelOverride ?? mapSeverityToLogLevel(error.severity);

    const baseLogPayload = this.buildErrorPayload(error, {
      detailed: Boolean(detailed),
    });

    const sanitizedMetadata = this.sanitizeLogMetadata(loggingContext);
    const mergedLogPayload = this.composeLogPayload(
      this.mapErrorPayloadToRecord(baseLogPayload),
      sanitizedMetadata,
    );

    console.log("[Logger] logBaseError", {
      code: error.code,
      level,
      message: message ?? error.message,
    });

    this.logAt(level, message ?? error.message, mergedLogPayload);
  }

  /**
   * Logs an unknown error value with rich, sanitized details.
   *
   * This is a convenience wrapper around {@link LoggingClient.logBaseError} that:
   * - Accepts an `unknown` error value.
   * - If the value is a {@link BaseError}, logs it with a detailed payload
   *   including stack traces and serialized cause information.
   * - If the value is not a {@link BaseError}, normalizes it into a
   *   safe error shape while preserving as much diagnostic information
   *   as possible.
   *
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
      const sanitizedMetadata = this.sanitizeLogMetadata(loggingContext);
      const safeErrorDetails = { error: toSafeErrorShape(error) };
      const errorLogPayload = this.composeLogPayload(
        sanitizedMetadata,
        safeErrorDetails,
      );

      console.log("[Logger] errorWithDetails nonBaseError", { message });

      this.error(message, errorLogPayload);
      return;
    }
    this.logBaseError(error, {
      detailed: true,
      levelOverride: "error",
      loggingContext,
      message,
    });
  }

  private composeLogPayload(
    ...segments: Array<Record<string, unknown> | undefined>
  ): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    for (const segment of segments) {
      if (!segment) {
        // biome-ignore lint/nursery/noContinue: <nursery rule>
        continue;
      }
      for (const [key, value] of Object.entries(segment)) {
        merged[key] = value;
      }
    }

    return Object.keys(merged)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = merged[key];
        return sorted;
      }, {});
  }

  private removeConflictingKeys(
    payload?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!payload) {
      return;
    }
    const filteredEntries = Object.entries(payload).filter(
      ([key]) => !LoggingClient.logMetadataConflictKeys.has(key),
    );
    if (filteredEntries.length === 0) {
      return;
    }
    return filteredEntries
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {});
  }

  private sanitizeLogMetadata(
    metadata?: LogEventContext,
  ): Record<string, unknown> | undefined {
    if (!metadata) {
      return;
    }
    return this.removeConflictingKeys(metadata as Record<string, unknown>);
  }

  private mapErrorPayloadToRecord(
    payload: BaseErrorLogPayload,
  ): Record<string, unknown> {
    return Object.keys(payload)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        const value = payload[key as keyof BaseErrorLogPayload];
        if (value !== undefined) {
          acc[key] = value as unknown;
        }
        return acc;
      }, {});
  }

  private buildErrorPayload(
    error: BaseError,
    options: { detailed: boolean },
  ): BaseErrorLogPayload {
    const { detailed } = options;
    const baseJson = error.toJson();
    const diagnosticId = this.extractDiagnosticId(error.context);

    const hasValidationErrors =
      (baseJson.formErrors && baseJson.formErrors.length > 0) ||
      (baseJson.fieldErrors && Object.keys(baseJson.fieldErrors).length > 0);

    const basePayload: BaseErrorLogPayload = {
      category: baseJson.category,
      code: baseJson.code,
      context: baseJson.context,
      description: baseJson.description,
      diagnosticId,
      ...(baseJson.fieldErrors && { fieldErrors: baseJson.fieldErrors }),
      ...(baseJson.formErrors && { formErrors: baseJson.formErrors }),
      message: baseJson.message,
      retryable: baseJson.retryable,
      severity: baseJson.severity,
      statusCode: baseJson.statusCode,
      ...(hasValidationErrors && { validationErrorPresent: true }),
    };

    if (!detailed) {
      return basePayload;
    }

    const detailedPayload: BaseErrorLogPayload = {
      ...basePayload,
      cause:
        error.cause instanceof Error
          ? this.serializeErrorCause(error.cause)
          : undefined,
      ...(error.originalCause !== error.cause && {
        originalCauseRedacted: true,
        originalCauseType: typeof error.originalCause,
      }),
      stack: error.stack,
    };

    return detailedPayload;
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

  private serializeErrorCause(cause: Error): SerializedErrorCause {
    if (isBaseError(cause)) {
      return {
        code: cause.code,
        message: cause.message,
        name: cause.name,
        severity: cause.severity,
        stack: cause.stack,
      };
    }

    return {
      message: cause.message,
      name: cause.name,
      stack: cause.stack,
    };
  }
}

// Default instance
export const logger = new LoggingClient();
