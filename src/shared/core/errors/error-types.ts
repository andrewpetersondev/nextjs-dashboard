import type { BaseError } from "@/shared/core/errors/base-error";

/**
 * Discriminated union for operation results.
 * - `ok: true` for success, with readonly value.
 * - `ok: false` for failure, with readonly error.
 * @template T - Success value type
 */
export type ErrorResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: BaseError };

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;
}
