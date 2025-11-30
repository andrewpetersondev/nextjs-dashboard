import type { AppErrorDefinition } from "@/shared/errors/core/error-definition.types";

export const DOMAIN_ERRORS = {
  domainError: {
    description: "Domain logic error",
    layer: "DOMAIN",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
