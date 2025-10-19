import type { ErrorLogger } from "@/shared/core/errors/logging/error-logger";
import { defaultErrorContextRedactor } from "@/shared/core/errors/redaction/redaction";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { toBaseErrorFromApp } from "@/shared/core/result/app-error/app-error-normalizers";

/**
 * Log an AppError by converting back to BaseError for unified metadata.
 */
export function logAppError(
  logger: ErrorLogger,
  appError: AppError,
  extra: Readonly<Record<string, unknown>> = {},
): void {
  const be = toBaseErrorFromApp(appError, "UNKNOWN").withContext({
    boundary: "ui",
  });
  const payload = {
    code: be.code,
    // Use shared default redactor
    context: defaultErrorContextRedactor({ ...be.context, ...extra }) ?? {
      ...be.context,
      ...extra,
    },
    message: be.message,
    name: appError.name ?? be.name,
    severity: be.severity,
    statusCode: be.statusCode,
  };
  logger.warn(payload, `[${be.code}] ${be.message}`);
}
