import type { LogLevel } from "@/shared/config/env-schemas";
import type { AppErrorSeverity } from "@/shared/errors/core/app-error.severity";
import { isAppError } from "@/shared/errors/utils/is-app-error";
import type { SafeErrorShape } from "@/shared/logging/core/logger.types";

/**
 * Normalize any `unknown` error into a safe, structured shape for logging.
 *
 * - If it's a AppError, returns it as-is (serialized later by logger).
 * - If it's a standard Error object, returns a POJO with message, name, and stack.
 * - If it's anything else (string, number, etc.), returns the string representation.
 */
export function toSafeErrorShape(err: unknown): SafeErrorShape | unknown {
  if (isAppError(err)) {
    return err;
  }
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      ...(err.stack && { stack: err.stack }),
    };
  }
  return String(err);
}

/**
 * Map domain `Severity` to `LogLevel` with an exhaustive check.
 */
export function mapSeverityToLogLevel(severity: AppErrorSeverity): LogLevel {
  switch (severity) {
    case "WARN":
      return "warn";
    case "INFO":
      return "info";
    case "ERROR":
      return "error";
    default: {
      const _exhaustive: never = severity;
      return _exhaustive;
    }
  }
}
