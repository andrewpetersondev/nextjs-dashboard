import type { BaseError } from "@/shared/core/errors/base";
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
 * Builds the structured payload; separate from side-effects for testability.
 */
function buildStructuredPayload(params: {
  base: BaseError | undefined;
  extra?: Record<string, unknown>;
  level: "error" | "warn" | "info";
  operation?: string;
  raw: unknown;
  redact?: (
    ctx: Record<string, unknown> | undefined,
  ) => Record<string, unknown> | undefined;
}): StructuredErrorLog {
  const { base, raw, level, operation, extra, redact } = params;
  const timestamp = new Date().toISOString();

  const unknownFallbackMessage =
    typeof raw === "object" &&
    raw !== null &&
    "message" in (raw as Record<string, unknown>) &&
    typeof (raw as Record<string, unknown>).message === "string"
      ? (raw as { message: string }).message
      : "Unknown error";

  const code = base?.code ?? "UNKNOWN";
  const name = base?.name ?? (raw instanceof Error ? raw.name : "UnknownError");
  const message = base?.message ?? unknownFallbackMessage;

  // Context redaction only if present.
  const context = redact
    ? redact((base as { context?: Record<string, unknown> })?.context)
    : (base as { context?: Record<string, unknown> })?.context;

  // Derive retry / transient hints if the BaseError exposes them.
  const retryable = (base as { retryable?: boolean })?.retryable;
  const transient = (base as { transient?: boolean })?.transient;
  const statusCode = (base as { statusCode?: number })?.statusCode;

  return {
    cause: extractCause(raw),
    code,
    context,
    extra,
    level,
    message,
    name,
    operation,
    retryable,
    stack: base?.stack ?? (raw instanceof Error ? raw.stack : undefined),
    statusCode,
    timestamp,
    transient,
  };
}

/**
 * Extract cause message if nested cause is present (Node >=16 Error options or custom).
 */
function extractCause(raw: unknown): string | undefined {
  const cause = (raw as { cause?: unknown })?.cause;
  if (!cause) {
    return;
  }
  if (typeof cause === "string") {
    return cause;
  }
  if (cause instanceof Error) {
    return cause.message;
  }
  if (
    typeof cause === "object" &&
    "message" in (cause as Record<string, unknown>)
  ) {
    const m = (cause as { message?: unknown }).message;
    return typeof m === "string" ? m : undefined;
  }
  return;
}

/**
 * Minimal logger interface to allow dependency injection (console, pino, bunyan, etc.).
 */
export interface LoggerLike {
  error: (...args: readonly unknown[]) => void;
  warn: (...args: readonly unknown[]) => void;
  info: (...args: readonly unknown[]) => void;
}

/**
 * Structured shape emitted for each error; safe to serialize.
 */
export interface StructuredErrorLog {
  readonly timestamp: string;
  readonly level: "error" | "warn" | "info";
  readonly code: string;
  readonly name: string;
  readonly message: string;
  readonly statusCode?: number;
  readonly operation?: string;
  readonly retryable?: boolean;
  readonly transient?: boolean;
  readonly context?: Record<string, unknown>;
  readonly extra?: Record<string, unknown>;
  readonly stack?: string;
  readonly cause?: string;
}

/**
 * Options object for logError.
 */
export interface LogErrorOptions {
  readonly error: unknown;
  /**
   * Extra ad-hoc fields (requestId, userId, etc.). Avoid secrets.
   */
  readonly extra?: Record<string, unknown>;
  /**
   * Override logging level (default: 'error').
   */
  readonly level?: "error" | "warn" | "info";
  /**
   * Optional logger; defaults to console.
   */
  readonly logger?: LoggerLike;
  readonly operation?: string;
  /**
   * Redaction hook: remove/transform sensitive fields inside context before logging.
   */
  readonly redact?: (
    ctx: Record<string, unknown> | undefined,
  ) => Record<string, unknown> | undefined;
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
