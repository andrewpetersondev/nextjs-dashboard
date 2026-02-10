import { type Brand, createBrand } from "@/shared/branding/brand";

// Keep naming consistent with shared/branding/brands.ts
export const UNIX_SECONDS_BRAND: unique symbol = Symbol("UnixSeconds");
export type UnixSeconds = Brand<number, typeof UNIX_SECONDS_BRAND>;

export const DURATION_SECONDS_BRAND: unique symbol = Symbol("DurationSeconds");
export type DurationSeconds = Brand<number, typeof DURATION_SECONDS_BRAND>;

// Signed time delta in seconds (can be negative), useful for "time left" calculations.
export const TIME_DELTA_SECONDS_BRAND: unique symbol =
  Symbol("TimeDeltaSeconds");

export type TimeDeltaSeconds = Brand<number, typeof TIME_DELTA_SECONDS_BRAND>;

export const createUnixSeconds: (value: number) => UnixSeconds = createBrand<
  number,
  typeof UNIX_SECONDS_BRAND
>(UNIX_SECONDS_BRAND);

export const createDurationSeconds: (value: number) => DurationSeconds =
  createBrand<number, typeof DURATION_SECONDS_BRAND>(DURATION_SECONDS_BRAND);

export const createTimeDeltaSeconds: (value: number) => TimeDeltaSeconds =
  createBrand<number, typeof TIME_DELTA_SECONDS_BRAND>(
    TIME_DELTA_SECONDS_BRAND,
  );
