import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { isPgMetadata } from "@/shared/errors/core/error-metadata.value";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";

export function toSignupUniquenessConflict(error: AppError): AppError | null {
  if (error.key !== APP_ERROR_KEYS.integrity || !isPgMetadata(error.metadata)) {
    return null;
  }

  const constraint = error.metadata.constraint ?? "";
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

  return makeAppError(APP_ERROR_KEYS.conflict, {
    cause: error,
    message: "Signup failed: value already in use",
    metadata: {
      pgCode: PG_CODES.UNIQUE_VIOLATION,
    },
  });
}
