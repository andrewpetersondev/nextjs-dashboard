import type { AppErrorDefinition } from "@/shared/errors/types";

export const INFRA_ERRORS = {
  database: {
    description: "Database operation failed",
    layer: "DB",
    retryable: true,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  infrastructure: {
    description: "Infrastructure failure",
    layer: "INTERNAL",
    retryable: true,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  integrity: {
    description: "Data integrity violation",
    layer: "DB",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
