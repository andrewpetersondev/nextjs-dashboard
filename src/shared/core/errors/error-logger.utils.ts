import type { BaseError } from "@/shared/core/errors/base-error";
import type { StructuredErrorLog } from "@/shared/core/errors/error-logger.types";
import { DEFAULT_UNKNOWN_MESSAGE } from "@/shared/core/result/error";

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
 * Builds the structured payload; separate from side-effects for testability.
 */
export function buildStructuredPayload(params: {
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
      : DEFAULT_UNKNOWN_MESSAGE;

  const code = base?.code ?? "UNKNOWN";
  const name =
    base?.name ?? (raw instanceof Error ? raw.name : DEFAULT_UNKNOWN_MESSAGE);
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
