// src/lib/errors/domain.errors.ts
/**
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-2-error-handling.md
 */
import { BaseError } from "./base.error";

export class ValidationError extends BaseError {
    readonly code = "VALIDATION_ERROR";
    readonly statusCode = 400;
}

export class NotFoundError extends BaseError {
    readonly code = "NOT_FOUND";
    readonly statusCode = 404;
}

export class UnauthorizedError extends BaseError {
    readonly code = "UNAUTHORIZED";
    readonly statusCode = 401;
}

export class ForbiddenError extends BaseError {
    readonly code = "FORBIDDEN";
    readonly statusCode = 403;
}

export class ConflictError extends BaseError {
    readonly code = "CONFLICT";
    readonly statusCode = 409;
}

export class DatabaseError extends BaseError {
    readonly code = "DATABASE_ERROR";
    readonly statusCode = 500;
}

export class CacheError extends BaseError {
    readonly code = "CACHE_ERROR";
    readonly statusCode = 500;
}

export class CryptoError extends BaseError {
    readonly code = "CRYPTO_ERROR";
    readonly statusCode = 500;
}
