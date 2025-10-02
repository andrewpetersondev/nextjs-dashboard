import "server-only";

import { DatabaseError } from "@/server/errors/infrastructure";
import { BaseError } from "@/shared/core/errors/base";
import { Err, Ok, type Result } from "@/shared/core/result/result";

export const asAppError = (e: unknown): BaseError => {
  if (e instanceof BaseError) {
    return e;
  }
  if (e instanceof Error) {
    return new DatabaseError(e.message, {}, e); // choose a safe default or map upstream
  }
  return new DatabaseError("Unknown error", { value: String(e) });
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
