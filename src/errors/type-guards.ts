import {
  CacheError_New,
  ConflictError_New,
  DatabaseError_New,
  ForbiddenError_New,
  NotFoundError_New,
  UnauthorizedError_New,
  ValidationError_New,
} from "@/errors/errors-domain";

/**
 * Type guard: checks whether an unknown value is a ValidationError_New.
 */
export const isValidationError_New = (e: unknown): e is ValidationError_New =>
  e instanceof ValidationError_New;

export const isNotFoundError_New = (e: unknown): e is NotFoundError_New =>
  e instanceof NotFoundError_New;

export const isUnauthorizedError_New = (
  e: unknown,
): e is UnauthorizedError_New => e instanceof UnauthorizedError_New;

export const isForbiddenError_New = (e: unknown): e is ForbiddenError_New =>
  e instanceof ForbiddenError_New;

export const isConflictError_New = (e: unknown): e is ConflictError_New =>
  e instanceof ConflictError_New;

export const isDatabaseError_New = (e: unknown): e is DatabaseError_New =>
  e instanceof DatabaseError_New;

export const isCacheError_New = (e: unknown): e is CacheError_New =>
  e instanceof CacheError_New;
