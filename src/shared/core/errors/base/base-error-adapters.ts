import { BaseError } from "@/shared/core/errors/base/base-error";

/**
 * @deprecated - use BaseError.from instead
 * Delegate entirely to BaseError.from to avoid duplication/drift
 */
export const normalizeToBaseError = (
  e: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
  context: Readonly<Record<string, unknown>> = {},
): BaseError => {
  return BaseError.from(e, fallbackCode, context);
};
