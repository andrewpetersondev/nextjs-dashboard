import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/errors/domain";

export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;

export const isNotFoundError = (e: unknown): e is NotFoundError =>
  e instanceof NotFoundError;

export const isUnauthorizedError = (e: unknown): e is UnauthorizedError =>
  e instanceof UnauthorizedError;

export const isForbiddenError = (e: unknown): e is ForbiddenError =>
  e instanceof ForbiddenError;

export const isConflictError = (e: unknown): e is ConflictError =>
  e instanceof ConflictError;
