/**
 * --- Action Result Type ---
 * Standardized result for server actions.
 */
export type ActionResult<TData = unknown> = {
  readonly message: string;
  readonly success: boolean;
  readonly errors: Record<string, string[]>;
  readonly data?: TData;
};
