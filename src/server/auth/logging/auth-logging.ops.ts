// src/server/auth/logging/auth-logging.ops.ts
import "server-only";
import {
  AUTH_LOG_CONTEXTS,
  AuthActionLogFactory,
  AuthServiceLogFactory,
} from "@/server/auth/logging/auth-logging.contexts";
import { toSafeErrorShape } from "@/shared/logging/logger.shared";

/* ------------------------------ Action layer ------------------------------ */

export const AUTH_ACTION_CONTEXTS = {
  demoUser: {
    context: AUTH_LOG_CONTEXTS.action("demoUser"),
    fail: (reason: string) =>
      AuthActionLogFactory.failure("demoUser", { reason }),
    start: () => AuthActionLogFactory.start("demoUser"),
    success: (role: string) =>
      AuthActionLogFactory.success("demoUser", { role }),
  },

  login: {
    context: AUTH_LOG_CONTEXTS.action("login"),
    // keep old "fail" name; delegate to standardized "validation"
    fail: (reason: string) =>
      AuthActionLogFactory.validation("login", { reason }),
    start: () => AuthActionLogFactory.start("login"),
    success: (userId: string) =>
      AuthActionLogFactory.success("login", { userId }),
    // optional explicit alias for clarity
    validation: (reason: string) =>
      AuthActionLogFactory.validation("login", { reason }),
  },

  signup: {
    context: AUTH_LOG_CONTEXTS.action("signup"),
    fail: (reason: string) =>
      AuthActionLogFactory.failure("signup", { reason }),
    start: () => AuthActionLogFactory.start("signup"),
    success: (email: string) =>
      AuthActionLogFactory.success("signup", { email }),
  },
} as const;

/* ----------------------------- Service layer ------------------------------ */

export const AUTH_SERVICE_CONTEXTS = {
  createDemoUser: {
    context: AUTH_LOG_CONTEXTS.service("demoUser"),

    // old "failCounter" -> map to exception with identifiers
    failCounter: (role: string) =>
      AuthServiceLogFactory.exception("demoUser", { role }),

    success: (role: string) =>
      AuthServiceLogFactory.success("demoUser", { role }),

    transactionError: (err: unknown) =>
      AuthServiceLogFactory.exception(
        "demoUser",
        undefined,
        toSafeErrorShape(err),
      ),
  },

  login: {
    context: AUTH_LOG_CONTEXTS.service("login"),

    invalidCredentials: (email: string) =>
      AuthServiceLogFactory.validation("login", { email }),

    missingPassword: (userId: string) =>
      AuthServiceLogFactory.authInvariant("login", { userId }),

    success: (userId: string) =>
      AuthServiceLogFactory.success("login", { userId }),

    transactionError: (err: unknown) =>
      AuthServiceLogFactory.exception(
        "login",
        undefined,
        toSafeErrorShape(err),
      ),
  },

  signup: {
    context: AUTH_LOG_CONTEXTS.service("signup"),

    success: (email: string) =>
      AuthServiceLogFactory.success("signup", { email }),

    transactionError: (err: unknown) =>
      AuthServiceLogFactory.exception(
        "signup",
        undefined,
        toSafeErrorShape(err),
      ),

    validationFail: () => AuthServiceLogFactory.validation("signup"),
  },
} as const;

/* Convenience type parity with the old module */
export type AuthServiceContext =
  (typeof AUTH_SERVICE_CONTEXTS)[keyof typeof AUTH_SERVICE_CONTEXTS];
