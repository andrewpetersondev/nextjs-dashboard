/**
 * --- Action Result Type ---
 * Standardized result for server actions.
 */
export type FieldErrors = Record<string, string[]>;

// ... existing code ...
export type ActionResult<TData = unknown> =
  | {
      readonly success: true;
      readonly message: string;
      readonly data?: TData;
    }
  | {
      readonly success: false;
      readonly message: string;
      readonly errors: FieldErrors;
    };
