import type { AppErrorDefinition } from "@/shared/errors/core/error-types";

export const CORE_ERRORS = {
  // Core/server errors
  missingFields: {
    description: "missing.required.fields",
    layer: "CORE",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  unexpected: {
    description: "An unexpected error occurred",
    layer: "CORE",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  unknown: {
    description: "An unknown error occurred",
    layer: "CORE",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
