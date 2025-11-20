// src/shared/errors/base-error.serialize.ts
import type { BaseError } from "@/shared/errors/base-error";
import type {
  BaseErrorLogPayload,
  SerializedErrorCause,
} from "@/shared/errors/base-error.types";

/**
 * Produce a JSON-safe, enriched payload for logging from a BaseError.
 * Includes core metadata, optional cause summary, and stack when available.
 */
export function serializeBaseError(error: BaseError): BaseErrorLogPayload {
  const json = error.toJson();

  let causePayload: SerializedErrorCause | undefined;

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    causePayload = {
      message: cause.message,
      name: cause.name,
      stack: typeof cause.stack === "string" ? cause.stack : undefined,
    };
  }

  const payload: BaseErrorLogPayload = {
    ...json,
    ...(causePayload ? { cause: causePayload } : {}),
    // Stack is intentionally non-enumerable on Error; expose for logs if present
    ...(typeof error.stack === "string" ? { stack: error.stack } : {}),
  };

  return payload;
}
