// src/shared/core/errors/error-logger.ts
import { BaseError } from "@/shared/core/errors/base-error";
import { toBaseError } from "@/shared/core/errors/error-adapters";
import { isBaseError } from "@/shared/core/errors/error-guards.shared";
import type {
  LogErrorOptions,
  StructuredErrorLog,
} from "@/shared/core/errors/error-logger.types";
import { buildStructuredPayload } from "@/shared/core/errors/error-logger.utils";
import type { AppError } from "@/shared/core/result/error";

// Add constants at the top of the file
const MAX_STRING_LENGTH = 1000;
const TRUNCATED_LENGTH = 997;
const TRUNCATION_SUFFIX = "...";

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
 * Redact large/unsafe fields before logging.
 */
function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.toLowerCase().includes("password")) {
      out[k] = "[REDACTED]";
      continue;
    }
    if (typeof v === "string" && v.length > MAX_STRING_LENGTH) {
      out[k] = `${v.slice(0, TRUNCATED_LENGTH)}${TRUNCATION_SUFFIX}`;
      continue;
    }
    out[k] = v;
  }
  return out;
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
    redact,
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
    context: redact({ ...be.context, ...extra }),
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
  const be = toBaseError(appError, "UNKNOWN").withContext({ boundary: "ui" });
  const payload = {
    code: be.code,
    context: redact({ ...be.context, ...extra }),
    message: be.message,
    name: appError.name ?? be.name,
    severity: be.severity,
    statusCode: be.statusCode,
  };
  logger.warn(payload, `[${be.code}] ${be.message}`);
}
