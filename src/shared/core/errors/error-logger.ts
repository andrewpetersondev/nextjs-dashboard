import type { BaseError } from "@/shared/core/errors/base-error";
import type {
  LogErrorOptions,
  StructuredErrorLog,
} from "@/shared/core/errors/error-logger.types";
import { buildStructuredPayload } from "@/shared/core/errors/error-logger.utils";
import { isBaseError } from "@/shared/core/errors/guards/error-guards";

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
