import type { Severity } from "@/shared/core/errors/base/error-codes";
import type { ErrorLogger } from "@/shared/core/errors/logging/error-logger";
import { defaultErrorContextRedactor } from "@/shared/core/errors/redaction/redaction";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { toBaseErrorFromApp } from "@/shared/core/result/app-error/app-error-normalizers";

// Select logger method by severity for better signal
function logBySeverity(
  logger: ErrorLogger,
  severity: Severity,
  payload: unknown,
  msg: string,
): void {
  if (severity === "info") {
    logger.info(payload, msg);
  } else if (severity === "warn") {
    logger.warn(payload, msg);
  } else {
    logger.error(payload, msg);
  }
}

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
    event: "app_error",
    message: be.message,
    name: appError.name ?? be.name,
    severity: be.severity,
    statusCode: be.statusCode,
  };
  logBySeverity(
    logger,
    be.severity === "warn" ? "warn" : be.severity,
    payload,
    `[${be.code}] ${be.message}`,
  );
}
