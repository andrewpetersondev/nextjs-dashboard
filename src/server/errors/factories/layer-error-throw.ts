import "server-only";

import { DatabaseError } from "@/server/errors/infrastructure-errors";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";

/**
 * Throwing-style helpers per layer.
 * These attach layer context to BaseError subclasses via details.
 */

// UI
export const throwUiValidation = (message: string): never => {
  throw new ValidationError(message, { layer: "ui" });
};
export const throwUiUnauthorized = (message: string): never => {
  throw new UnauthorizedError(message, { layer: "ui" });
};

// Action
export const throwActionValidation = (message: string): never => {
  throw new ValidationError(message, { layer: "action" });
};
export const throwActionUnauthorized = (message: string): never => {
  throw new UnauthorizedError(message, { layer: "action" });
};

// Service
export const throwServiceConflict = (
  message: string,
  cause?: unknown,
): never => {
  throw new ConflictError(message, { cause, layer: "service" });
};
export const throwServiceValidation = (message: string): never => {
  throw new ValidationError(message, { layer: "service" });
};

// Repository

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

/**
 * Throws a `ValidationError` indicating a failure in repository creation.
 *
 * @param message - The error message describing the cause of failure.
 * @throws ValidationError - Always throws with the specified message and layer information.
 * @example
 * throwRepoCreateFailed("Repository creation failed due to invalid input.");
 * @public
 */
export const throwRepoCreateFailed = (message: string): never => {
  throw new ValidationError(message, { layer: "repository" });
};

// DAL
export const throwDalDatabase = (message: string, cause?: unknown): never => {
  throw new DatabaseError(
    message,
    { layer: "dal" },
    cause instanceof Error ? cause : undefined,
  );
};
export const throwDalConflict = (message: string, cause?: unknown): never => {
  throw new ConflictError(message, { cause, layer: "dal" });
};
