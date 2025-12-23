import "server-only";

import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

export function toSignupUniquenessConflict(error: AppError): AppError | null {
  if (error.code !== "integrity") {
    return null;
  }

  const constraintRaw = error.metadata?.constraint;
  const constraint = typeof constraintRaw === "string" ? constraintRaw : "";

  const fieldErrors: Record<string, string[]> = {};

  if (constraint.includes("email")) {
    fieldErrors.email = ["alreadyInUse"];
  }

  if (constraint.includes("username")) {
    fieldErrors.username = ["alreadyInUse"];
  }

  if (Object.keys(fieldErrors).length === 0) {
    return null;
  }

  return makeAppError("conflict", {
    cause: error,
    message: "Signup failed: value already in use",
    metadata: { fieldErrors },
  });
}
