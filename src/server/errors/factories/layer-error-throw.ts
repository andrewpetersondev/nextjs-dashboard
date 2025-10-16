import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";

/**
 * Throws a `DatabaseError` with a specified message and optional cause,
 * indicating an error in the repository layer.
 *
 * @param message - The error message describing the issue.
 * @param cause - An optional value providing the underlying error cause.
 * @throws {DatabaseError} Always throws a `DatabaseError`.
 * @public
 * @example
 * throwRepoDatabaseErr("Invalid data access", new Error("Connection failure"));
 */
export const throwRepoDatabaseErr = (
  message: string,
  cause?: unknown,
): never => {
  throw new DatabaseError(
    message,
    { layer: "repository" },
    cause instanceof Error ? cause : undefined,
  );
};
