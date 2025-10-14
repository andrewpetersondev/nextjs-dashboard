import type { ErrorCode } from "@/shared/core/errors/base/error-codes";

export const FRIENDLY_ERROR_MESSAGES: Partial<Record<ErrorCode, string>> = {
  INTERNAL: "Something went wrong. Please try again.",
  UNKNOWN: "An unexpected error occurred.",
};
