/**
 * Internal parameters for form validation.
 * Use this to ensure all required context is provided for a validation operation.
 *
 * @typeParam K - A string literal union representing field names.
 */
export interface FormValidationParams<K extends string> {
  readonly failureMessage: string;
  readonly fields: readonly K[] | undefined;
  readonly loggerContext: string;
  readonly raw: Readonly<Partial<Record<K, unknown>>> | undefined;
  readonly successMessage: string;
}

/**
 * Input options for form validation.
 *
 * @typeParam T - The shape of the object being validated.
 * @typeParam K - A string literal union of keys from `T` representing field names.
 */
export interface FormValidationOptions<T, K extends keyof T & string> {
  readonly fields?: readonly K[];
  readonly loggerContext?: string;
  readonly messages?: {
    readonly failureMessage?: string;
    readonly successMessage?: string;
  };
  readonly raw?: Readonly<Partial<Record<K, unknown>>>;
}
