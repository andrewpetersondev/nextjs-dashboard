import type { LogLevel } from "@/shared/core/config/env-schemas";
import {
  type AppError,
  isAppError,
} from "@/shared/core/errors/core/app-error.entity";
import type {
  BaseErrorLogPayload,
  LogBaseErrorOptions,
  LogEventContext,
  LogOperationData,
  SerializedError,
} from "@/shared/telemetry/logging/core/logger.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";
import { AbstractLogger } from "@/shared/telemetry/logging/infrastructure/abstract-logger";
import { toSafeErrorShape } from "@/shared/telemetry/logging/infrastructure/logging.mappers";

/**
 * Sensitivity-aware structured logger implementation.
 * Handles AppError serialization and operational metadata injection.
 */
export class LoggingClient
  extends AbstractLogger
  implements LoggingClientContract
{
  /**
   * @inheritdoc
   */
  override withContext(context: string): LoggingClient {
    const combined = this.loggerContext
      ? `${this.loggerContext}:${context}`
      : context;

    return new LoggingClient(combined, this.loggerRequestId, this.bindings);
  }

  /**
   * @inheritdoc
   */
  override withRequest(requestId: string): LoggingClient {
    return new LoggingClient(this.loggerContext, requestId, this.bindings);
  }

  /**
   * @inheritdoc
   */
  override child(bindings: Record<string, unknown>): LoggingClient {
    return new LoggingClient(this.loggerContext, this.loggerRequestId, {
      ...this.bindings,
      ...bindings,
    });
  }

  /**
   * Logs a structured application “operation” event.
   */
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    operationPayload: LogOperationData<T>,
  ): void {
    const { operationContext, operationIdentifiers, operationName, ...rest } =
      operationPayload;

    const { error, ...otherData } = rest as Record<string, unknown>;

    const safeError = error ? toSafeErrorShape(error) : undefined;

    const operationLogPayload = {
      ...(safeError ? { error: safeError } : {}),
      log: {
        ...otherData,
        identifiers: operationIdentifiers,
        operationName,
      },
    };

    const target = this.withContext(operationContext);
    target.logAt(level, message, operationLogPayload);
  }

  /**
   * Log a AppError with structured, sanitized output.
   */
  logBaseError(error: AppError, options: LogBaseErrorOptions): void {
    const { levelOverride, loggingContext, message } = options;

    const level = levelOverride;
    const baseLogPayload = this.buildErrorPayload(error);

    const mergedLogPayload = {
      error: baseLogPayload,
      log: loggingContext,
    };

    this.logAt(level, message, mergedLogPayload);
  }

  /**
   * Logs an unknown error value with rich, sanitized details.
   */
  errorWithDetails(
    message: string,
    error: unknown,
    loggingContext: LogEventContext,
  ): void {
    if (!isAppError(error)) {
      const safeError = toSafeErrorShape(error);

      const errorPayload = {
        error: safeError,
        log: loggingContext,
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

  // TODO: INDICATES A POSSIBLE ISSUE
  // biome-ignore lint/suspicious/noExplicitAny: keep until a better solution
  private buildErrorPayload(error: AppError<any>): BaseErrorLogPayload {
    const baseJson = error.toDto();
    const diagnosticId = this.extractDiagnosticId(error.metadata);

    const isValidation =
      error.key === "validation" || error.key === "missing_fields";

    const fieldErrors = isValidation
      ? ((error.metadata as Record<string, unknown>)?.fieldErrors as
          | Record<string, readonly string[]>
          | undefined)
      : undefined;

    const formErrors = isValidation
      ? ((error.metadata as Record<string, unknown>)?.formErrors as
          | readonly string[]
          | undefined)
      : undefined;

    const hasValidationErrors =
      (formErrors && formErrors.length > 0) ||
      (fieldErrors && Object.keys(fieldErrors).length > 0);

    // Double cast to bypass missing index signature in AppError
    const rawError = error as unknown as Record<string, unknown>;
    // TODO: INDICATES A POSSIBLE CONCERN
    // biome-ignore lint/complexity/useLiteralKeys: POSSIBLE ISSUE
    const originalCause = rawError["originalCause"];
    const hasOriginalCause = originalCause !== undefined;

    return {
      ...baseJson,
      cause:
        error.cause instanceof Error
          ? (toSafeErrorShape(error.cause) as SerializedError)
          : undefined,
      diagnosticId,
      stack: error.stack,
      ...(fieldErrors && { fieldErrors }),
      ...(formErrors && { formErrors }),
      ...(hasValidationErrors && { validationErrorPresent: true }),
      ...(hasOriginalCause &&
        error.cause !== originalCause && {
          originalCauseRedacted: true,
          originalCauseType: typeof originalCause,
        }),
    };
  }

  private extractDiagnosticId(
    metadata: Record<string, unknown> | undefined,
  ): string | undefined {
    if (metadata === undefined) {
      return;
    }

    const id = metadata.diagnosticId;

    return typeof id === "string" ? id : undefined;
  }
}

export const logger: LoggingClient = new LoggingClient();
