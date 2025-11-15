import "server-only";
import {
  type SafeErrorShape,
  toSafeErrorShape,
} from "@/shared/logging/logger.shared";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type TransactionExceptionPayload = {
  kind: "exception";
  error: SafeErrorShape;
};

/* -------------------------------------------------------------------------- */
/*                                ACTION CONTEXTS                             */
/* -------------------------------------------------------------------------- */

/**
 * Action-level log data factories (triggered directly by user interaction)
 */
export const AUTH_ACTION_CONTEXTS = {
  demoUser: {
    context: "action.auth.demo-user" as const,
    fail: (reason: string) => ({ kind: "failure", reason }),
    start: () => ({ kind: "start" }),
    success: (role: string) => ({ kind: "success", role }),
  },

  login: {
    context: "action.auth.login" as const,
    fail: (reason: string) => ({ kind: "failure", reason }),
    start: () => ({ kind: "start" }),
    success: (userId: string) => ({ kind: "success", userId }),
  },

  signup: {
    context: "action.auth.signup" as const,
    fail: (reason: string) => ({ kind: "failure", reason }),
    start: () => ({ kind: "start" }),
    success: (email: string) => ({ email, kind: "success" }),
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                               SERVICE CONTEXTS                             */
/* -------------------------------------------------------------------------- */

/**
 * Internal service-level log data factories (server-only logic)
 */
export const AUTH_SERVICE_CONTEXTS = {
  createDemoUser: {
    context: "service.auth.create-demo-user" as const,

    failCounter: (role: string) => ({
      kind: "error",
      role,
    }),

    success: (role: string) => ({
      kind: "success",
      role,
    }),

    transactionError: (err: unknown): TransactionExceptionPayload => ({
      error: toSafeErrorShape(err),
      kind: "exception",
    }),
  },

  login: {
    context: "service.auth.login" as const,

    invalidCredentials: (email: string) => ({
      email,
      kind: "validation",
    }),

    missingPassword: (userId: string) => ({
      kind: "auth-invariant",
      userId,
    }),

    success: (userId: string) => ({
      kind: "success",
      userId,
    }),

    transactionError: (err: unknown): TransactionExceptionPayload => ({
      error: toSafeErrorShape(err),
      kind: "exception",
    }),
  },

  signup: {
    context: "service.auth.signup" as const,

    success: (email: string) => ({
      email,
      kind: "success",
    }),

    transactionError: (err: unknown): TransactionExceptionPayload => ({
      error: toSafeErrorShape(err),
      kind: "exception",
    }),

    validationFail: () => ({
      kind: "validation",
    }),
  },
} as const;

/**
 * Convenience type for IntelliSense & type safety.
 */
export type AuthServiceContext =
  (typeof AUTH_SERVICE_CONTEXTS)[keyof typeof AUTH_SERVICE_CONTEXTS];
