import { ValidationError } from "@/shared/core/errors/domain";

export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;
