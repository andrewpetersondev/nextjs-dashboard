import "server-only";

import { DatabaseError_New } from "@/server/errors/infrastructure";
import { ValidationError_New } from "@/shared/errors/domain";

/**
 * Convert an arbitrary details value into a safe context object.
 * Kept for backward-compatibility with legacy error constructors.
 */
export function toContext(details?: unknown): Record<string, unknown> {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    return details as Record<string, unknown>;
  }
  return details === undefined ? {} : { details };
}

/**
 * Deprecated shim for legacy ValidationError usage.
 * - Server-only: depends on server infrastructure error model.
 * - Prefer using `ValidationError_New` (from shared/errors/domain) directly.
 */
export class ValidationError extends ValidationError_New {
  /** Back-compat: optional details bag */
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, toContext(details));
    this.details = details;
    this.name = new.target.name;
  }
}

/**
 * Deprecated shim for legacy DatabaseError usage.
 * - Server-only: part of infrastructure; do not use in shared/features.
 * - Prefer using `DatabaseError_New` (from server/errors/infrastructure) directly.
 */
export class DatabaseError extends DatabaseError_New {
  /** Back-compat: optional details bag */
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, toContext(details));
    this.details = details;
    this.name = new.target.name;
  }
}
