import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";

// Formerly mapped AuthError -> AppError; now identity passthrough.
export function mapAuthServiceErrorToAppError(e: AppError): AppError {
  return e;
}
