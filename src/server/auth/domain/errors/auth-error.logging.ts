import "server-only";

/* -------------------------------------------------------------------------- */
/*                                ACTION CONTEXTS                             */
/* -------------------------------------------------------------------------- */

/**
 * Action-level log data factories (triggered directly by user interaction)
 */
export const AUTH_ACTION_CONTEXTS = {
  DEMO_USER: {
    CONTEXT: "action.auth.demo-user" as const,
    FAIL: (reason: string) => ({ kind: "failure", reason }),
    START: () => ({ kind: "start" }),
    SUCCESS: (role: string) => ({ kind: "success", role }),
  },

  LOGIN: {
    CONTEXT: "action.auth.login" as const,
    FAIL: (reason: string) => ({ kind: "failure", reason }),
    START: () => ({ kind: "start" }),
    SUCCESS: (userId: string) => ({ kind: "success", userId }),
  },

  SIGNUP: {
    CONTEXT: "action.auth.signup" as const,
    FAIL: (reason: string) => ({ kind: "failure", reason }),
    START: () => ({ kind: "start" }),
    SUCCESS: (email: string) => ({ email, kind: "success" }),
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                               SERVICE CONTEXTS                             */
/* -------------------------------------------------------------------------- */

/**
 * Internal service-level log data factories (server-only logic)
 */
export const AUTH_SERVICE_CONTEXTS = {
  CREATE_DEMO_USER: {
    CONTEXT: "service.auth.create-demo-user" as const,

    FAIL_COUNTER: (role: string) => ({
      kind: "error",
      role,
    }),

    SUCCESS: (role: string) => ({
      kind: "success",
      role,
    }),

    TRANSACTION_ERROR: (err: unknown) => ({
      error:
        err instanceof Error
          ? { message: err.message, stack: err.stack }
          : String(err),
      kind: "exception",
    }),
  },

  LOGIN: {
    CONTEXT: "service.auth.login" as const,

    INVALID_CREDENTIALS: (email: string) => ({
      email,
      kind: "validation",
    }),

    MISSING_PASSWORD: (userId: string) => ({
      kind: "auth-invariant",
      userId,
    }),

    SUCCESS: (userId: string) => ({
      kind: "success",
      userId,
    }),

    TRANSACTION_ERROR: (err: unknown) => ({
      error:
        err instanceof Error
          ? { message: err.message, stack: err.stack }
          : String(err),
      kind: "exception",
    }),
  },

  SIGNUP: {
    CONTEXT: "service.auth.signup" as const,

    SUCCESS: (email: string) => ({
      email,
      kind: "success",
    }),

    TRANSACTION_ERROR: (err: unknown) => ({
      error:
        err instanceof Error
          ? { message: err.message, stack: err.stack }
          : String(err),
      kind: "exception",
    }),

    VALIDATION_FAIL: () => ({
      kind: "validation",
    }),
  },
} as const;

/**
 * Convenience type for IntelliSense & type safety.
 */
export type AuthServiceContext =
  (typeof AUTH_SERVICE_CONTEXTS)[keyof typeof AUTH_SERVICE_CONTEXTS];
