import type { AppErrorDefinition } from "@/shared/errors/types";

export const VALIDATION_ERRORS = {
  validation: {
    description: "Validation failed",
    layer: "VALIDATION",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
