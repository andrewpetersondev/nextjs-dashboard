// src/shared/core/errors/error-logger.ts

import { BaseError } from "@/shared/core/errors/base/base-error";
import { defaultErrorContextRedactor } from "@/shared/core/errors/redaction/redaction";

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
