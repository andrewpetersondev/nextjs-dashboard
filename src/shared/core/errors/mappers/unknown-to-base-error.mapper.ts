// src/shared/core/errors/mappers/unknown-to-base-error.mapper.ts
import { BaseError } from "@/shared/core/errors/base-error";

/**
 * Map infrastructure/library errors into canonical BaseError codes.
 * Extend with specific instanceof/regex checks as needed.
 */
export function mapUnknownToBaseError(
  err: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
): BaseError {
  if (err instanceof BaseError) {
    return err;
  }

  // Example shapes; customize per integration:
  // if (isPgError(err)) return new BaseError("DATABASE", err.message, { code: err.code }, err);

  if (err instanceof Error) {
    return new BaseError(fallbackCode, err.message, {}, err);
  }
  return BaseError.from(err, fallbackCode);
}
