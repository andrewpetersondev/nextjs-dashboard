import "server-only";

/**
 * Standard discriminated union type for revenue operation results.
 *
 * Provides a consistent success / error response structure across all revenue
 * actions and services. Enables type-safe error handling and result processing.
 *
 * @template T - The type of data returned on successful operations
 */
export type RevenueActionResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };
