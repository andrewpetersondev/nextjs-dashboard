import { BaseError } from "@/shared/core/errors/base";
import { ValidationError } from "@/shared/core/errors/domain";

export const isBaseError = (e: unknown): e is BaseError =>
  e instanceof BaseError;

export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;

export const isRetryableError = (e: unknown): e is BaseError =>
  e instanceof BaseError && e.retryable;
