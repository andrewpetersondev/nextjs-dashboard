import type { AppErrorDefinition } from "@/shared/errors/core/error-types";

export const VALIDATION_ERRORS = {
  // Generic validation semantics
  validation: {
    description: "Validation failed",
    layer: "VALIDATION",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
