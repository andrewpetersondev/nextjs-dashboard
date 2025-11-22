// src/shared/logging/logger.shared.ts
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
  SerializedErrorCause,
} from "@/shared/logging/core/logger.types";
import { AbstractLogger } from "@/shared/logging/infra/abstract-logger";
import {
  mapSeverityToLogLevel,
  toSafeErrorShape,
} from "@/shared/logging/infra/shared-logger.mappers";

/**
 * Sensitivity-aware structured logger.
 */
export class LoggingClient
  extends AbstractLogger
  implements LoggingClientContract
{
  // TODO: refactor names in logger to make this obsolete
  private static readonly logMetadataConflictKeys = new Set(["do_not_log_me"]);

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

    const target = operationContext ? this.withContext(operationContext) : this;
    target.logAt(level, message, operationLogPayload);
  }

  /**
   * Log a BaseError with structured, sanitized output.
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
      const sanitizedMetadata = this.sanitizeLogMetadata(loggingContext);
      const safeErrorDetails = { error: toSafeErrorShape(error) };
      const errorLogPayload = this.composeLogPayload(
        sanitizedMetadata,
        safeErrorDetails,
      );

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
      code: baseJson.code,
      context: baseJson.context,
      description: baseJson.description,
      diagnosticId,
      layer: baseJson.layer,
      ...(baseJson.fieldErrors && { fieldErrors: baseJson.fieldErrors }),
      ...(baseJson.formErrors && { formErrors: baseJson.formErrors }),
      message: baseJson.message,
      retryable: baseJson.retryable,
      severity: baseJson.severity,
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

export const logger = new LoggingClient();
