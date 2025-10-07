import "server-only";

import { DatabaseError } from "@/server/errors/infrastructure";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-error";

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
export const throwRepoDatabase = (message: string, cause?: unknown): never => {
  throw new DatabaseError(
    message,
    { layer: "repository" },
    cause instanceof Error ? cause : undefined,
  );
};
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
