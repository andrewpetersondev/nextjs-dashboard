import type { AppErrorDefinition } from "@/shared/errors/core/types";

export const INFRA_ERRORS = {
  // Infrastructure / integration boundaries
  database: {
    description: "Database operation failed",
    layer: "INFRA",
    retryable: true,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  infrastructure: {
    description: "Infrastructure failure",
    layer: "INFRA",
    retryable: true,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
  integrity: {
    description: "Data integrity violation",
    layer: "INFRA",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
