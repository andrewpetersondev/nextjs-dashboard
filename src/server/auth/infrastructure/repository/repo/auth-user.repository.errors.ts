import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import {
  ConflictError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";

export function isRepoKnownError(
  err: unknown,
): err is ConflictError | ValidationError | DatabaseError {
  return (
    err instanceof ConflictError ||
    err instanceof ValidationError ||
    err instanceof DatabaseError
  );
}
