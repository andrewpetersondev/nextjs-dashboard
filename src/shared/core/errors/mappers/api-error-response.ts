import type { BaseError } from "@/shared/core/errors/base";
import {
  GENERIC_ERROR_CODE,
  GENERIC_ERROR_STATUS,
} from "@/shared/core/errors/error-codes";
import { GENERIC_ERROR_MESSAGE } from "@/shared/core/errors/error-messages";
import { DEFAULT_SENSITIVE_KEYS } from "@/shared/core/errors/error-redaction";
import type { ApiError } from "@/shared/core/errors/error-types";
import { isBaseError } from "@/shared/core/errors/guards/error-guards";
import { isErrorDetailPrimitive } from "@/shared/core/errors/guards/is-error-detail-primitive.guard";

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
    if (isErrorDetailPrimitive(v)) {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Map unknown error into an API-safe shape.
 * - Uses BaseError fields when present (assumed to be safe for clients)
 * - For non-Base errors returns a generic message and 500 status
 * - Never includes stack/cause/raw context; only whitelisted shallow details
 */
export function mapUnknownToApiError(e: unknown): ApiError {
  if (isBaseError(e)) {
    const base = e as BaseError;
    const code = base.code ?? GENERIC_ERROR_CODE;
    const status =
      typeof (base as { statusCode?: unknown }).statusCode === "number"
        ? (base as { statusCode: number }).statusCode
        : GENERIC_ERROR_STATUS;
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
    code: GENERIC_ERROR_CODE,
    message: GENERIC_ERROR_MESSAGE,
    status: GENERIC_ERROR_STATUS,
  };
  return generic;
}
