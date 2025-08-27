export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Create a branded type for stricter type safety.
 */
export const createBrand = <T, B extends symbol>(_brandSymbol: B) => {
  return (value: T): Brand<T, B> => value as Brand<T, B>;
};

export const isBrand = <T, B extends symbol>(
  value: unknown,
  validator: (v: unknown) => v is T,
): value is Brand<T, B> => validator(value);

/**
 * How to use.
 * - Use when inside server/domain layers: unbrand.
 * - DO NOT use when emitting to DTOs/JSON/URLs/logs: convert intentionally (e.g., String(id), date.toISOString(), toPeriodFirstDayString(period)).
 */
export const unbrand = <T, B extends symbol>(brandedValue: Brand<T, B>): T =>
  brandedValue as T;
