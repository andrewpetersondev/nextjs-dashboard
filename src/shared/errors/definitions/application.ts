import type { AppErrorDefinition } from "@/shared/errors/types";

export const APPLICATION_ERRORS = {
  applicationError: {
    description: "Application logic error",
    layer: "INTERNAL",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
