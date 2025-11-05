import type { Logger } from "@/shared/logging/logger.shared";
import type { PerformanceTracker } from "./performance-tracker";

export interface ActionLogContext {
  email?: string;
  ip: string;
  tracker: PerformanceTracker;
  errorCode?: string;
  errorMessage?: string;
}

export function logActionInitiated(
  logger: Logger,
  metadata: { ip: string; userAgent: string },
): void {
  logger.info("Action initiated", {
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  });
}

export function logValidationComplete(
  logger: Logger,
  context: { email?: string; duration: number },
): void {
  logger.info("Form validated successfully", {
    email: context.email,
    validationDuration: context.duration,
  });
}

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

export function logAuthenticationFailure(
  logger: Logger,
  context: ActionLogContext,
): void {
  logger.error("Authentication failed", {
    ...context.tracker.getMetrics(),
    email: context.email,
    errorCode: context.errorCode,
    errorMessage: context.errorMessage,
    ip: context.ip,
  });
}

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
