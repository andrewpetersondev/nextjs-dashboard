/**
 * A branded type for stricter compile-time type safety.
 *
 * Prevents accidental assignment between structurally identical types.
 *
 * @typeParam T - The underlying type being branded.
 * @typeParam B - A unique symbol distinguishing this brand from others.
 */
export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Create a branding function for a specific type and symbol.
 *
 * @typeParam T - The underlying type to brand.
 * @typeParam B - The unique brand symbol.
 * @param _brandSymbol - The symbol used to distinguish this branded type.
 * @returns A function that applies the brand to a value of type `T`.
 *
 * @example
 * const brandCustomerId = createBrand(CUSTOMER_ID_BRAND);
 * const id: CustomerId = brandCustomerId("123e4567-e89b-12d3-a456-426614174000");
 */
export const createBrand = <T, B extends symbol>(_brandSymbol: B) => {
  return (value: T): Brand<T, B> => value as Brand<T, B>;
};

/**
 * Check if a value matches a branded type using a validator.
 *
 * @typeParam T - The underlying type of the branded value.
 * @typeParam B - The brand symbol.
 * @param value - The value to check.
 * @param validator - A type guard function for the underlying type.
 * @returns `true` if the value passes validation and can be treated as the branded type.
 */
export const isBrand = <T, B extends symbol>(
  value: unknown,
  validator: (v: unknown) => v is T,
): value is Brand<T, B> => validator(value);

/**
 * Remove the brand from a branded value, returning the underlying type.
 *
 * Use this inside server/domain layers when the brand is no longer needed.
 * Do NOT use when emitting to DTOs/JSON/URLs/logs—convert intentionally instead
 * (e.g., `String(id)`, `date.toISOString()`, `toPeriodFirstDayString(period)`).
 *
 * @typeParam T - The underlying type.
 * @typeParam B - The brand symbol.
 * @param brandedValue - The branded value to unwrap.
 * @returns The underlying value without the brand.
 */
export const unbrand = <T, B extends symbol>(brandedValue: Brand<T, B>): T =>
  brandedValue as T;
