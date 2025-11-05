// src/server/auth/application/actions/utils/action-logger.helper.ts
import type { LoggerPort } from "@/shared/logging/logger.port";
import type { PerformanceTracker } from "./performance-tracker";

export interface ActionLogContext {
  email?: string;
  ip: string;
  tracker: PerformanceTracker;
  errorCode?: string;
  errorMessage?: string;
}

export function logActionInitiated(
  logger: LoggerPort,
  metadata: { ip: string; userAgent: string },
): void {
  logger.info("Action initiated", {
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  });
}

export function logValidationComplete(
  logger: LoggerPort,
  context: { email?: string; duration: number },
): void {
  logger.info("Form validated successfully", {
    email: context.email,
    validationDuration: context.duration,
  });
}

export function logValidationFailure(
  logger: LoggerPort,
  context: { errorCount: number; ip: string; tracker: PerformanceTracker },
): void {
  logger.warn("Validation failed", {
    duration: context.tracker.getTotalDuration(),
    errorCount: context.errorCount,
    ip: context.ip,
  });
}

export function logAuthenticationFailure(
  logger: LoggerPort,
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
  logger: LoggerPort,
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
