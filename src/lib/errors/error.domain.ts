import "server-only";

import { BaseError } from "@/lib/errors/error.base";

export class ValidationError_New extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
}

export class NotFoundError_New extends BaseError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;
}

export class UnauthorizedError_New extends BaseError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;
}

export class ForbiddenError_New extends BaseError {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;
}

export class ConflictError_New extends BaseError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;
}

export class DatabaseError_New extends BaseError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;
}

export class CacheError_New extends BaseError {
  readonly code = "CACHE_ERROR";
  readonly statusCode = 500;
}

export class CryptoError_New extends BaseError {
  readonly code = "CRYPTO_ERROR";
  readonly statusCode = 500;
}
