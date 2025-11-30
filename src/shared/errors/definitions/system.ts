import type { AppErrorDefinition } from "@/shared/errors/schema";

export const SYSTEM_ERRORS = {
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
