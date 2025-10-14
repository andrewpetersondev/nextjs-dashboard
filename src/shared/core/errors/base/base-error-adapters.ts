import { BaseError } from "@/shared/core/errors/base/base-error";

export const normalizeToBaseError = (
  e: unknown,
  fallbackCode: BaseError["code"] = "UNKNOWN",
  context: Readonly<Record<string, unknown>> = {},
): BaseError => {
  if (e instanceof BaseError) {
    return e;
  }
  if (e instanceof Error) {
    return new BaseError(fallbackCode, e.message, { ...context }, e);
  }
  return BaseError.from(e, fallbackCode, { ...context });
};
