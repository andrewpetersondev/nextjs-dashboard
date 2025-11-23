// src/server/auth/logging/auth-logging.ops.ts
import "server-only";
import type { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import {
  AUTH_LOG_CONTEXTS,
  AuthActionLogFactory,
} from "@/server/auth/logging-auth/auth-logging.contexts";
import type { AuthLogPayload } from "@/server/auth/logging-auth/auth-logging.types";
import type { LogOperationData } from "@/shared/logging/core/logger.types";

export const AUTH_ACTION_CONTEXTS = {
  demoUser: {
    context: AUTH_LOG_CONTEXTS.action("demoUser"),

    fail(reason: string): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.failure("demoUser", { reason }),
        operationContext: AUTH_LOG_CONTEXTS.action("demoUser"),
      };
    },

    initiatedPayload(metadata: { ip: string; userAgent: string }) {
      return {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      };
    },

    start(): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.start("demoUser"),
        operationContext: AUTH_LOG_CONTEXTS.action("demoUser"),
      };
    },

    successAction(role: string): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.success("demoUser", { role }),
        operationContext: AUTH_LOG_CONTEXTS.action("demoUser"),
      };
    },

    successPayload(metadata: {
      userId: string;
      role: string;
      tracker: PerformanceTracker;
    }) {
      return {
        ...metadata.tracker.getMetrics(),
        role: metadata.role,
        userId: metadata.userId,
      };
    },

    validationCompletePayload(metadata: { email?: string; duration: number }) {
      return {
        email: metadata.email,
        validationDuration: metadata.duration,
      };
    },

    validationFailed(metadata: { errorCount: number; ip: string }) {
      return AuthActionLogFactory.validation("demoUser", {
        errorCount: metadata.errorCount,
        ip: metadata.ip,
      });
    },

    validationFailurePayload(metadata: {
      errorCount: number;
      ip: string;
      tracker: PerformanceTracker;
    }) {
      return {
        duration: metadata.tracker.getTotalDuration(),
        errorCount: metadata.errorCount,
        ip: metadata.ip,
      };
    },
  },

  login: {
    context: AUTH_LOG_CONTEXTS.action("login"),

    fail(reason: string): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.failure("login", { reason }),
        operationContext: AUTH_LOG_CONTEXTS.action("login"),
      };
    },

    initiatedPayload(metadata: { ip: string; userAgent: string }) {
      return {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      };
    },

    start(): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.start("login"),
        operationContext: AUTH_LOG_CONTEXTS.action("login"),
      };
    },

    successAction(userId: string): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.success("login", { userId }),
        operationContext: AUTH_LOG_CONTEXTS.action("login"),
      };
    },

    successPayload(metadata: {
      userId: string;
      role: string;
      tracker: PerformanceTracker;
    }) {
      return {
        ...metadata.tracker.getMetrics(),
        role: metadata.role,
        userId: metadata.userId,
      };
    },

    validationCompletePayload(metadata: { email?: string; duration: number }) {
      return {
        email: metadata.email,
        validationDuration: metadata.duration,
      };
    },

    validationFailed(metadata: { errorCount: number; ip: string }) {
      return AuthActionLogFactory.validation("login", {
        errorCount: metadata.errorCount,
        ip: metadata.ip,
      });
    },

    validationFailurePayload(metadata: {
      errorCount: number;
      ip: string;
      tracker: PerformanceTracker;
    }) {
      return {
        duration: metadata.tracker.getTotalDuration(),
        errorCount: metadata.errorCount,
        ip: metadata.ip,
      };
    },
  },

  signup: {
    context: AUTH_LOG_CONTEXTS.action("signup"),

    fail(reason: string): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.failure("signup", { reason }),
        operationContext: AUTH_LOG_CONTEXTS.action("signup"),
      };
    },

    initiatedPayload(metadata: { ip: string; userAgent: string }) {
      return {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      };
    },

    start(): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.start("signup"),
        operationContext: AUTH_LOG_CONTEXTS.action("signup"),
      };
    },

    successAction(email: string): LogOperationData<AuthLogPayload> {
      return {
        ...AuthActionLogFactory.success("signup", { email }),
        operationContext: AUTH_LOG_CONTEXTS.action("signup"),
      };
    },

    successPayload(metadata: {
      userId: string;
      role: string;
      tracker: PerformanceTracker;
    }) {
      return {
        ...metadata.tracker.getMetrics(),
        role: metadata.role,
        userId: metadata.userId,
      };
    },

    validationCompletePayload(metadata: { email?: string; duration: number }) {
      return {
        email: metadata.email,
        validationDuration: metadata.duration,
      };
    },

    validationFailed(metadata: { errorCount: number; ip: string }) {
      return AuthActionLogFactory.validation("signup", {
        errorCount: metadata.errorCount,
        ip: metadata.ip,
      });
    },

    validationFailurePayload(metadata: {
      errorCount: number;
      ip: string;
      tracker: PerformanceTracker;
    }) {
      return {
        duration: metadata.tracker.getTotalDuration(),
        errorCount: metadata.errorCount,
        ip: metadata.ip,
      };
    },
  },
} as const;
