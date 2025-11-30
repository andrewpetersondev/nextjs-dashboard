import type { AppErrorDefinition } from "@/shared/errors/schema";

export const PRESENTATION_ERRORS = {
  presentationError: {
    description: "Presentation layer error",
    layer: "UI",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
