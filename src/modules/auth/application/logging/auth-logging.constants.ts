/**
 * Application-level constants for authentication logging and operations.
 */

export const AUTH_LOG_CONTEXTS = {
  SESSION: "session",
  USE_CASE: "use-case",
} as const;

export const AUTH_OPERATIONS = {
  ANTI_ENUMERATION: "anti-enumeration",
  SESSION_ESTABLISH_SUCCESS: "session.establish.success",
  SESSION_READ_INVALID_CLAIMS: "session.read.invalid_claims",
} as const;

export const AUTH_USE_CASE_NAMES = {
  CREATE_DEMO_USER: "createDemoUser",
  ESTABLISH_SESSION: "establishSession",
  GET_SESSION: "getSession",
  LOGIN_USER: "loginUser",
  READ_SESSION: "readSession",
  ROTATE_SESSION: "rotateSession",
  SIGNUP_USER: "createUser",
  TERMINATE_SESSION: "terminateSession",
} as const;
