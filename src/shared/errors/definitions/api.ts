import type { AppErrorDefinition } from "@/shared/errors/types";

export const API_ERRORS = {
  conflict: {
    description: "Resource state conflict",
    layer: "API",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
  forbidden: {
    description: "Operation not allowed",
    layer: "SECURITY",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
  notFound: {
    description: "Resource not found",
    layer: "API",
    retryable: false,
    severity: "INFO",
  } as const satisfies AppErrorDefinition,
  parse: {
    description: "Parsing input failed",
    layer: "API",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
