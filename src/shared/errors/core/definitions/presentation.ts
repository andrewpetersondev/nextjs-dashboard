import type { AppErrorDefinition } from "@/shared/errors/core/error-types";

export const PRESENTATION_ERRORS = {
  // Presentation layer (ui, http)
  presentationError: {
    description: "Presentation layer error",
    layer: "PRESENTATION",
    retryable: false,
    severity: "ERROR",
  } as const satisfies AppErrorDefinition,
} as const;
