// src/lib/errors/error-helpers.ts
/**
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-2-error-handling.md
 */
import { Err, Ok, type Result } from "../core/result";
import { BaseError } from "./base.error";
import { DatabaseError } from "./domain.errors";

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

export const errorToHttp = (e: unknown): { status: number; body: HttpErrorBody } => {
    const err = asAppError(e);
    return {
        status: err.statusCode,
        body: { error: { code: err.code, message: err.message, context: err.context } },
    };
};
