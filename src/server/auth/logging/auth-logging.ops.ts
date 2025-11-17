// src/server/auth/logging/auth-logging.ops.ts
import "server-only";
import type { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import {
  AUTH_LOG_CONTEXTS,
  AuthActionLogFactory,
  AuthServiceLogFactory,
} from "@/server/auth/logging/auth-logging.contexts";
import type {
  AuthActionLog,
  AuthServiceLog,
} from "@/server/auth/logging/auth-logging.types";
import { toSafeErrorShape } from "@/shared/logging/logger.shared";
import type { OperationData } from "@/shared/logging/logger.types";

/* ------------------------------ Action layer ------------------------------ */

export const AUTH_ACTION_CONTEXTS = {
  demoUser: {
    authenticationFailurePayload(metadata: {
      ip: string;
      tracker: PerformanceTracker;
      email?: string;
      errorCode?: string;
      errorMessage?: string;
    }) {
      return {
        ...metadata.tracker.getMetrics(),
        email: metadata.email,
        errorCode: metadata.errorCode,
        errorMessage: metadata.errorMessage,
        ip: metadata.ip,
      };
    },
    context: AUTH_LOG_CONTEXTS.action("demoUser"),

    fail(reason: string): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.failure("demoUser", { reason }),
        context: AUTH_LOG_CONTEXTS.action("demoUser"),
      };
    },

    initiatedPayload(metadata: { ip: string; userAgent: string }) {
      return {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      };
    },

    start(): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.start("demoUser"),
        context: AUTH_LOG_CONTEXTS.action("demoUser"),
      };
    },

    successAction(role: string): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.success("demoUser", { role }),
        context: AUTH_LOG_CONTEXTS.action("demoUser"),
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
    authenticationFailurePayload(metadata: {
      ip: string;
      tracker: PerformanceTracker;
      email?: string;
      errorCode?: string;
      errorMessage?: string;
    }) {
      return {
        ...metadata.tracker.getMetrics(),
        email: metadata.email,
        errorCode: metadata.errorCode,
        errorMessage: metadata.errorMessage,
        ip: metadata.ip,
      };
    },

    context: AUTH_LOG_CONTEXTS.action("login"),

    fail(reason: string): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.failure("login", { reason }),
        context: AUTH_LOG_CONTEXTS.action("login"),
      };
    },

    initiatedPayload(metadata: { ip: string; userAgent: string }) {
      return {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      };
    },

    start(): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.start("login"),
        context: AUTH_LOG_CONTEXTS.action("login"),
      };
    },

    successAction(userId: string): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.success("login", { userId }),
        context: AUTH_LOG_CONTEXTS.action("login"),
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
    authenticationFailurePayload(metadata: {
      ip: string;
      tracker: PerformanceTracker;
      email?: string;
      errorCode?: string;
      errorMessage?: string;
    }) {
      return {
        ...metadata.tracker.getMetrics(),
        email: metadata.email,
        errorCode: metadata.errorCode,
        errorMessage: metadata.errorMessage,
        ip: metadata.ip,
      };
    },

    context: AUTH_LOG_CONTEXTS.action("signup"),

    fail(reason: string): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.failure("signup", { reason }),
        context: AUTH_LOG_CONTEXTS.action("signup"),
      };
    },

    initiatedPayload(metadata: { ip: string; userAgent: string }) {
      return {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      };
    },

    start(): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.start("signup"),
        context: AUTH_LOG_CONTEXTS.action("signup"),
      };
    },

    successAction(email: string): OperationData<AuthActionLog> {
      return {
        ...AuthActionLogFactory.success("signup", { email }),
        context: AUTH_LOG_CONTEXTS.action("signup"),
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

/* ----------------------------- Service layer ------------------------------ */

export const AUTH_SERVICE_CONTEXTS = {
  createDemoUser: {
    context: AUTH_LOG_CONTEXTS.service("demoUser"),

    failCounter(role: string): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.exception("demoUser", { role }),
        context: AUTH_LOG_CONTEXTS.service("demoUser"),
      };
    },

    success(role: string): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.success("demoUser", { role }),
        context: AUTH_LOG_CONTEXTS.service("demoUser"),
      };
    },

    transactionError(err: unknown): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.exception(
          "demoUser",
          undefined,
          toSafeErrorShape(err),
        ),
        context: AUTH_LOG_CONTEXTS.service("demoUser"),
      };
    },
  },

  login: {
    context: AUTH_LOG_CONTEXTS.service("login"),

    invalidCredentials(email: string): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.validation("login", { email }),
        context: AUTH_LOG_CONTEXTS.service("login"),
      };
    },

    missingPassword(userId: string): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.authInvariant("login", { userId }),
        context: AUTH_LOG_CONTEXTS.service("login"),
      };
    },

    success(userId: string): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.success("login", { userId }),
        context: AUTH_LOG_CONTEXTS.service("login"),
      };
    },

    transactionError(err: unknown): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.exception(
          "login",
          undefined,
          toSafeErrorShape(err),
        ),
        context: AUTH_LOG_CONTEXTS.service("login"),
      };
    },
  },

  signup: {
    context: AUTH_LOG_CONTEXTS.service("signup"),

    success(email: string): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.success("signup", { email }),
        context: AUTH_LOG_CONTEXTS.service("signup"),
      };
    },

    transactionError(err: unknown): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.exception(
          "signup",
          undefined,
          toSafeErrorShape(err),
        ),
        context: AUTH_LOG_CONTEXTS.service("signup"),
      };
    },

    validationFail(): OperationData<AuthServiceLog> {
      return {
        ...AuthServiceLogFactory.validation("signup"),
        context: AUTH_LOG_CONTEXTS.service("signup"),
      };
    },
  },
} as const;

/* Convenience type parity with the old module */
export type AuthServiceContext =
  (typeof AUTH_SERVICE_CONTEXTS)[keyof typeof AUTH_SERVICE_CONTEXTS];
