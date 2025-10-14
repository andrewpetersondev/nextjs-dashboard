import { BaseError } from "@/shared/core/errors/base/base-error";

// Refactor: use new BaseError constructor/options and BaseError.from
export const normalizeToBaseError = (
  e: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
  context: Readonly<Record<string, unknown>> = {},
): BaseError => {
  if (e instanceof BaseError) {
    return e;
  }
  if (e instanceof Error) {
    return new BaseError(fallbackCode, {
      cause: e,
      context,
      message: e.message,
    });
  }
  return BaseError.from(e, fallbackCode, context);
};
