import type { AppErrorDefinition } from "@/shared/errors/core/error-types";

export const AUTH_ERRORS = {
  invalidCredentials: {
    description: "Invalid credentials",
    layer: "AUTH",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
  // Auth semantics (distinct from generic validation)
  unauthorized: {
    description: "Invalid credentials",
    layer: "AUTH",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
