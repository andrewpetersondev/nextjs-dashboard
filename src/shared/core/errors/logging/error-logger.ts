// src/shared/core/errors/error-logger.ts

import { toBaseErrorFromApp } from "@/shared/core/errors/adapters/app-error-normalizers";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { isBaseError } from "@/shared/core/errors/base/error-guards";
import type {
  LogErrorOptions,
  StructuredErrorLog,
} from "@/shared/core/errors/logging/error-logger.contracts";
import { buildStructuredPayload } from "@/shared/core/errors/logging/error-logger.payload";
import { defaultErrorContextRedactor } from "@/shared/core/errors/redaction/redaction";
import type { AppError } from "@/shared/core/result/app-error";

/**
 * Attempt to extract a BaseError-like shape from unknown without throwing.
 */
function coerceBaseError(e: unknown): BaseError | undefined {
  if (isBaseError(e)) {
    return e;
  }
  return;
}

/**
 * Log an error in a structured, redactable form.
 *
 * @returns StructuredErrorLog (also emitted via provided logger).
 */
export function logError(options: LogErrorOptions): StructuredErrorLog {
  const {
    error,
    operation,
    extra,
    level = "error",
    logger = console,
    redact,
  } = options;

  const base = coerceBaseError(error);
  const payload = buildStructuredPayload({
    base,
    extra,
    level,
    operation,
    raw: error,
    redact: redact ?? defaultErrorContextRedactor,
  });

  // Immutable emission object.
  const emission: StructuredErrorLog = Object.freeze(payload);

  // Select log method based on level.
  switch (level) {
    case "info":
      logger.info(emission);
      break;
    case "warn":
      logger.warn(emission);
      break;
    default:
      logger.error(emission);
  }

  return emission;
}

/**
 * Minimal logger interface (pino-compatible subset).
 */
export interface ErrorLogger {
  readonly error: (obj: unknown, msg?: string) => void;
  readonly warn: (obj: unknown, msg?: string) => void;
  readonly info: (obj: unknown, msg?: string) => void;
}

/**
 * Log unknown error as BaseError with safe context.
 * Use in server layers only.
 */
export function logUnknownAsBaseError(
  logger: ErrorLogger,
  err: unknown,
  extra: Readonly<Record<string, unknown>> = {},
): void {
  const be =
    err instanceof BaseError
      ? err
      : BaseError.from(err, "UNKNOWN", { source: "unknown" });
  const payload = {
    code: be.code,
    // Use shared default redactor
    context: defaultErrorContextRedactor({ ...be.context, ...extra }) ?? {
      ...be.context,
      ...extra,
    },
    message: be.message,
    name: be.name,
    retryable: be.retryable,
    severity: be.severity,
    statusCode: be.statusCode,
  };
  logger.error(payload, `[${be.code}] ${be.message}`);
}

/**
 * Log an AppError by converting back to BaseError for unified metadata.
 */
export function logAppError(
  logger: ErrorLogger,
  appError: AppError,
  extra: Readonly<Record<string, unknown>> = {},
): void {
  const be = toBaseErrorFromApp(appError, "UNKNOWN").withContext({
    boundary: "ui",
  });
  const payload = {
    code: be.code,
    // Use shared default redactor
    context: defaultErrorContextRedactor({ ...be.context, ...extra }) ?? {
      ...be.context,
      ...extra,
    },
    message: be.message,
    name: appError.name ?? be.name,
    severity: be.severity,
    statusCode: be.statusCode,
  };
  logger.warn(payload, `[${be.code}] ${be.message}`);
}
