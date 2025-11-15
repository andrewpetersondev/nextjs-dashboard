import "server-only";
import { toSafeErrorShape } from "@/shared/logging/logger.shared";
import type { SafeErrorShape } from "@/shared/logging/logger.types";

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
 *
 * Login action `kind` values:
 * - "start"      : action initiated
 * - "validation" : user-facing credential/validation failure
 * - "success"    : login completed successfully
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
    // align with service-level invalidCredentials kind
    fail: (reason: string) => ({ kind: "validation", reason }),
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
 *
 * Login service `kind` values:
 * - "validation"    : invalid credentials (email/password)
 * - "auth-invariant": internal auth invariant breach (e.g. missing password hash)
 * - "success"       : login completed successfully
 * - "exception"     : unexpected exception during login flow
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
      // keep distinct invariant for debugging
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
