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

// Create a success result for RevenueActionResult.
export function createSuccessResult<T>(data: T): RevenueActionResult<T> {
  return { data, success: true } as const;
}

// Create an error result for RevenueActionResult.
export function createErrorResult<T>(error: string): RevenueActionResult<T> {
  return { error, success: false } as const;
}
