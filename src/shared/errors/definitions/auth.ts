import type { AppErrorDefinition } from "@/shared/errors/schema";

export const AUTH_ERRORS = {
  invalidCredentials: {
    description: "Invalid credentials",
    layer: "SECURITY",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
  unauthorized: {
    description: "Unauthorized",
    layer: "SECURITY",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
