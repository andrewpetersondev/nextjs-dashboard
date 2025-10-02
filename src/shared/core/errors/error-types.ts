import type { BaseError } from "./base";

// Optional Result pattern (if not already defined elsewhere)
export type ErrorResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: BaseError };
