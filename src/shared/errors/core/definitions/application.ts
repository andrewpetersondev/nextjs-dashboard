import type { AppErrorDefinition } from "@/shared/errors/core/types";

export const APPLICATION_ERRORS = {
  // Application layer (service, action)
  applicationError: {
    description: "Application logic error",
    layer: "APPLICATION",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
