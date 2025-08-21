import "server-only";
import { Err, Ok, type Result } from "@/core/result-base";
import { BaseError } from "@/errors/errors-base";
import { DatabaseError_New } from "@/errors/errors-domain";

export type HttpErrorBody = {
  error: {
    code: string;
    message: string;
    context?: Record<string, unknown>;
  };
};

export const asAppError = (e: unknown): BaseError => {
  if (e instanceof BaseError) return e;
  if (e instanceof Error) {
    return new DatabaseError_New(e.message, {}, e); // choose a safe default or map upstream
  }
  return new DatabaseError_New("Unknown error", { value: String(e) });
};

export const errorToResult = <T = never>(e: unknown): Result<T, BaseError> =>
  Err(asAppError(e));

export const safeTry = <T>(fn: () => T): Result<T, BaseError> => {
  try {
    return Ok(fn());
  } catch (e) {
    return errorToResult<T>(e);
  }
};

export const safeFromPromise = async <T>(
  p: Promise<T>,
): Promise<Result<T, BaseError>> => {
  try {
    return Ok(await p);
  } catch (e) {
    return errorToResult<T>(e);
  }
};

export const errorToHttp = (
  e: unknown,
): { status: number; body: HttpErrorBody } => {
  const err = asAppError(e);
  return {
    body: {
      error: { code: err.code, context: err.context, message: err.message },
    },
    status: err.statusCode,
  };
};
