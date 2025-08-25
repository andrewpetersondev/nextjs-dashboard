import "server-only";

import { DatabaseError_New } from "@/server/errors/infrastructure";
import { toContext } from "@/shared/errors/domain";

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
