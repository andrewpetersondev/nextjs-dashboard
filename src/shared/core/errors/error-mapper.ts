import type { BaseErrorJSON } from "@/shared/core/errors/base";
import { BaseError } from "@/shared/core/errors/base";
import {UnknownError} from "@/shared/core/errors/domain";

/**
 * Normalize any thrown value to a BaseError instance.
 *
 * @param err - unknown thrown value
 * @param context - supplemental context to attach if a wrapping occurs
 * @returns BaseError (original or wrapped)
 */
export function mapToBaseError(
  err: unknown,
  context: Record<string, unknown> = {},
): BaseError {
  if (err instanceof BaseError) {
    return err;
  }

  if (err instanceof Error) {
    return new UnknownError(err.message, context, err);
  }

  let message: string;
  try {
    message =
      typeof err === "string"
        ? err
        : JSON.stringify(err, (_k, v) =>
            typeof v === "bigint" ? v.toString() : v,
          );
  } catch {
    message = "Non-serializable thrown value";
  }

  return new UnknownError(message, { ...context, originalType: typeof err });
}

/**
 * Get a stable, JSON-safe canonical error shape for any thrown value.
 *
 * @param err - unknown thrown value
 * @param context - optional additional context merged if wrapping occurs
 * @returns BaseErrorJSON
 */
export function normalizeErrorJSON(
  err: unknown,
  context: Record<string, unknown> = {},
): BaseErrorJSON {
  return mapToBaseError(err, context).toJSON();
}
