import type { AppErrorDefinition } from "@/shared/errors/core/types";

export const DOMAIN_ERRORS = {
  // Domain layer (repo, domain logic)
  domainError: {
    description: "Domain logic error",
    layer: "DOMAIN",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
