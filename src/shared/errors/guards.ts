import {
  ConflictError_New,
  ForbiddenError_New,
  NotFoundError_New,
  UnauthorizedError_New,
  ValidationError_New,
} from "@/shared/errors/domain";

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
