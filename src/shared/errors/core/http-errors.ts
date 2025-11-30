import type { AppErrorDefinition } from "@/shared/errors/core/error-types";

export const HTTP_ERRORS = {
  // HTTP/client semantics (domain meaning: conflict in state)
  conflict: {
    description: "Resource state conflict",
    layer: "HTTP",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
  forbidden: {
    description: "Operation not allowed",
    layer: "HTTP",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
  notFound: {
    description: "Resource not found",
    layer: "HTTP",
    retryable: false,
    severity: "INFO",
  } as const satisfies AppErrorDefinition,
  parse: {
    description: "Parsing input failed",
    layer: "HTTP",
    retryable: false,
    severity: "WARN",
  } as const satisfies AppErrorDefinition,
} as const;
