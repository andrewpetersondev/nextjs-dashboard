import { AppError } from "@/shared/errors/core/app-error.entity";
import { isPgMetadata } from "@/shared/errors/core/error-metadata.value";

/**
 * Walks an {@link AppError} cause chain and returns the first Postgres `constraint`
 * value found in pg metadata.
 */
export function getPgConstraintFromAppError(
  error: AppError,
): string | undefined {
  let current: AppError | undefined = error;

  while (current) {
    if (isPgMetadata(current.metadata) && current.metadata.constraint) {
      return current.metadata.constraint;
    }

    const cause: AppError | Error | string = current.cause;
    current = cause instanceof AppError ? cause : undefined;
  }

  return;
}
