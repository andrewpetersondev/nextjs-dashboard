import type { AppErrorDefinition } from "@/shared/errors/types";

export const SYSTEM_ERRORS = {
  missingFields: {
    description: "missing.required.fields",
    layer: "VALIDATION",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  unexpected: {
    description: "An unexpected error occurred",
    layer: "INTERNAL",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  unknown: {
    description: "An unknown error occurred",
    layer: "INTERNAL",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
