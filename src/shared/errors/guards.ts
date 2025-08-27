import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/errors/domain";

export const isValidationError_New = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;

export const isNotFoundError_New = (e: unknown): e is NotFoundError =>
  e instanceof NotFoundError;

export const isUnauthorizedError_New = (e: unknown): e is UnauthorizedError =>
  e instanceof UnauthorizedError;

export const isForbiddenError_New = (e: unknown): e is ForbiddenError =>
  e instanceof ForbiddenError;

export const isConflictError_New = (e: unknown): e is ConflictError =>
  e instanceof ConflictError;
