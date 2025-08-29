import { ValidationError } from "@/shared/errors/domain";

export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;
