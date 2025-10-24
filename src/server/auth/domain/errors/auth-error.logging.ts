import "server-only";
import { createLogContext } from "@/server/logging/serverLogger";

/* -------------------------------------------------------------------------- */
/*                                ACTION CONTEXTS                             */
/* -------------------------------------------------------------------------- */
/**
 * Action-level contexts (triggered directly by user interaction)
 */
export const AUTH_ACTION_CONTEXTS = {
  DEMO_USER: {
    CONTEXT: "action.auth.demo-user",
    FAIL: (reason: string) =>
      createLogContext(
        "action.auth.demo-user",
        "failure",
        "Failed to create demo user",
        { reason },
      ),
    START: () =>
      createLogContext(
        "action.auth.demo-user",
        "start",
        "Starting demo user creation",
      ),
    SUCCESS: (role: string) =>
      createLogContext(
        "action.auth.demo-user",
        "success",
        "Demo user created successfully",
        { role },
      ),
  },

  LOGIN: {
    CONTEXT: "action.auth.login",
    FAIL: (reason: string) =>
      createLogContext("action.auth.login", "failure", "Login failed", {
        reason,
      }),
    START: () =>
      createLogContext("action.auth.login", "start", "Login attempt started"),
    SUCCESS: (userId: string) =>
      createLogContext("action.auth.login", "success", "User logged in", {
        userId,
      }),
  },

  SIGNUP: {
    CONTEXT: "action.auth.signup",
    FAIL: (reason: string) =>
      createLogContext("action.auth.signup", "failure", "Signup failed", {
        reason,
      }),
    START: () =>
      createLogContext("action.auth.signup", "start", "Signup attempt started"),
    SUCCESS: (email: string) =>
      createLogContext("action.auth.signup", "success", "User signed up", {
        email,
      }),
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                               SERVICE CONTEXTS                             */
/* -------------------------------------------------------------------------- */
/**
 * Internal service-level contexts (server-only logic)
 * Used for diagnostics, invariants, and transactional errors.
 */
export const AUTH_SERVICE_CONTEXTS = {
  CREATE_DEMO_USER: {
    CONTEXT: "service.auth.create-demo-user",

    FAIL_COUNTER: (role: string) =>
      createLogContext(
        "service.auth.create-demo-user",
        "error",
        "Failed to fetch demo user counter",
        { role },
      ),

    SUCCESS: (role: string) =>
      createLogContext(
        "service.auth.create-demo-user",
        "success",
        "Demo user created successfully",
        { role },
      ),

    TRANSACTION_ERROR: (err: unknown) =>
      createLogContext(
        "service.auth.create-demo-user",
        "exception",
        "Unexpected error during demo user creation",
        { error: err instanceof Error ? err.message : String(err) },
      ),
  },

  LOGIN: {
    CONTEXT: "service.auth.login",

    INVALID_CREDENTIALS: (email: string) =>
      createLogContext(
        "service.auth.login",
        "validation",
        "Invalid credentials provided",
        { email },
      ),

    MISSING_PASSWORD: (userId: string) =>
      createLogContext(
        "service.auth.login",
        "auth-invariant",
        "Missing hashed password on user entity; cannot authenticate",
        { userId },
      ),

    SUCCESS: (userId: string) =>
      createLogContext(
        "service.auth.login",
        "success",
        "User logged in successfully",
        { userId },
      ),

    TRANSACTION_ERROR: (err: unknown) =>
      createLogContext(
        "service.auth.login",
        "exception",
        "Unexpected error during login",
        { error: err instanceof Error ? err.message : String(err) },
      ),
  },

  SIGNUP: {
    CONTEXT: "service.auth.signup",

    SUCCESS: (email: string) =>
      createLogContext(
        "service.auth.signup",
        "success",
        "User signed up successfully",
        { email },
      ),

    TRANSACTION_ERROR: (err: unknown) =>
      createLogContext(
        "service.auth.signup",
        "exception",
        "Unexpected error during signup",
        { error: err instanceof Error ? err.message : String(err) },
      ),

    VALIDATION_FAIL: () =>
      createLogContext(
        "service.auth.signup",
        "validation",
        "Missing required signup fields",
      ),
  },
} as const;

/**
 * Convenience type for IntelliSense & type safety.
 */
export type AuthServiceContext =
  (typeof AUTH_SERVICE_CONTEXTS)[keyof typeof AUTH_SERVICE_CONTEXTS];
