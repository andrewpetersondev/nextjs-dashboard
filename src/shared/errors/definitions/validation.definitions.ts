import type { AppErrorDefinition } from "@/shared/errors/core/error-definition.types";

export const VALIDATION_ERRORS = {
  missingFields: {
    description: "missing.required.fields",
    layer: "VALIDATION",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  validation: {
    description: "Validation failed",
    layer: "VALIDATION",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
