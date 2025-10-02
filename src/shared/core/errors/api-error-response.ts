import type { BaseError } from "@/shared/core/errors/base";
import { isBaseError } from "@/shared/core/errors/error-guards";
import { DEFAULT_SENSITIVE_KEYS } from "@/shared/core/errors/error-redaction";

/**
 * Small type guard for primitives we allow in details.
 */
function isAllowedPrimitive(v: unknown): v is string | number | boolean {
  return (
    typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
}

/**
 * Extract a shallow, safe details object from an unknown context.
 * - only includes primitive values
 * - excludes keys that match DEFAULT_SENSITIVE_KEYS (case-insensitive)
 * - returns undefined if nothing safe to include
 */
function extractSafeDetails(ctx: unknown): Record<string, unknown> | undefined {
  if (!ctx || typeof ctx !== "object") {
    return;
  }
  const sensitive = new Set<string>(
    DEFAULT_SENSITIVE_KEYS.map((k) => k.toLowerCase()),
  );
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(ctx as Record<string, unknown>)) {
    if (sensitive.has(k.toLowerCase())) {
      continue;
    }
    if (isAllowedPrimitive(v)) {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;
}

/**
 * Map unknown error into an API-safe shape.
 * - Uses BaseError fields when present (assumed to be safe for clients)
 * - For non-Base errors returns a generic message and 500 status
 * - Never includes stack/cause/raw context; only whitelisted shallow details
 */
export function toApiError(e: unknown): ApiError {
  if (isBaseError(e)) {
    const base = e as BaseError;
    const code = base.code ?? "UNKNOWN";
    const status =
      typeof (base as { statusCode?: unknown }).statusCode === "number"
        ? (base as { statusCode: number }).statusCode
        : 500;
    // Domain BaseError messages are considered the intended client-facing message.
    const message = base.message ?? "Internal server error";
    // Safely surface only non-sensitive primitive details if available.
    const ctxCandidate =
      (base as unknown as Record<string, unknown>).context ??
      (base as unknown as Record<string, unknown>).details;
    const details = extractSafeDetails(ctxCandidate);
    return { code, message, status, ...(details ? { details } : {}) };
  }

  // Non-domain errors: do not reveal internal messages/stacks.
  const generic: ApiError = {
    code: "UNKNOWN",
    message: "Internal server error",
    status: 500,
  };
  return generic;
}
