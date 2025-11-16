// src/server/auth/logging/action-logger.helper.ts
import "server-only";
import type { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import type { Logger } from "@/shared/logging/logger.shared";

/**
 * Log that an action has been initiated.
 *
 * @param logger - Logger instance to use for writing the log.
 * @param metadata - Metadata about the incoming request.
 * @param metadata.ip - Client IP address.
 * @param metadata.userAgent - User-Agent string from the request.
 * @returns void
 */
export function logActionInitiated(
  logger: Logger,
  metadata: { ip: string; userAgent: string },
): void {
  logger.info("Action initiated", {
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  });
}

/**
 * Log that form validation completed successfully.
 *
 * @param logger - Logger instance to use for writing the log.
 * @param context - Validation context.
 * @param context.email - Optional email associated with the form.
 * @param context.duration - Validation duration in milliseconds.
 * @returns void
 */
export function logValidationComplete(
  logger: Logger,
  context: { email?: string; duration: number },
): void {
  logger.info("Form validated successfully", {
    email: context.email,
    validationDuration: context.duration,
  });
}

/**
 * Log that validation failed.
 *
 * @param logger - Logger instance to use for writing the log.
 * @param context - Context for the validation failure.
 * @param context.errorCount - Number of validation errors encountered.
 * @param context.ip - Client IP address.
 * @param context.tracker - Performance tracker used to compute durations.
 * @returns void
 */
export function logValidationFailure(
  logger: Logger,
  context: { errorCount: number; ip: string; tracker: PerformanceTracker },
): void {
  logger.warn("Validation failed", {
    duration: context.tracker.getTotalDuration(),
    errorCount: context.errorCount,
    ip: context.ip,
  });
}

/**
 * Log an authentication failure with performance metrics and error details.
 *
 * @param logger - Logger instance to use for writing the log.
 * @param context - Action log context including tracker and optional error details.
 * @returns void
 */
export function logAuthenticationFailure(
  logger: Logger,
  context: {
    ip: string;
    tracker: PerformanceTracker;
    email?: string;
    errorCode?: string;
    errorMessage?: string;
  },
): void {
  logger.error("Authentication failed", {
    ...context.tracker.getMetrics(),
    email: context.email,
    errorCode: context.errorCode,
    errorMessage: context.errorMessage,
    ip: context.ip,
  });
}

/**
 * Log that an action completed successfully including performance metrics and identity.
 *
 * @param logger - Logger instance to use for writing the log.
 * @param context - Context containing identity and the performance tracker.
 * @param context.userId - Unique identifier of the user.
 * @param context.role - Role assigned to the user for this action.
 * @param context.tracker - Performance tracker used to obtain metrics.
 * @returns void
 */
export function logActionSuccess(
  logger: Logger,
  context: {
    userId: string;
    role: string;
    tracker: PerformanceTracker;
  },
): void {
  logger.info("Action completed successfully", {
    ...context.tracker.getMetrics(),
    role: context.role,
    userId: context.userId,
  });
}
