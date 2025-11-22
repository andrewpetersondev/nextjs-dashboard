import type { LogLevel } from "@/shared/config/env-schemas";
import type { Severity } from "@/shared/errors/core/error-codes";
import type { SafeErrorShape } from "@/shared/logging/core/logger.types";

/**
 * Normalize any `unknown` error into a safe, structured shape for logging.
 */
export function toSafeErrorShape(err: unknown): SafeErrorShape {
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
 * Map domain \`Severity\` to \`LogLevel\` with an exhaustive check.
 */
export function mapSeverityToLogLevel(severity: Severity): LogLevel {
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
