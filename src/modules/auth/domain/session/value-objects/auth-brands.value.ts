import { type Brand, createBrand } from "@/shared/core/branding/brand";

const UNIX_SECONDS_BRAND: unique symbol = Symbol("UnixSeconds");
const DURATION_SECONDS_BRAND: unique symbol = Symbol("DurationSeconds");
const TIME_DELTA_SECONDS_BRAND: unique symbol = Symbol("TimeDeltaSeconds");

/**
 * An absolute instant, in seconds since the Unix epoch.
 *
 * Distinct from the two below so a timestamp can never be passed where a length
 * of time is expected — `expiresAt` and `maxAge` are both numbers, and swapping
 * them is otherwise a silent bug.
 */
export type UnixSeconds = Brand<number, typeof UNIX_SECONDS_BRAND>;

/**
 * A length of time in seconds, never negative — a session's age or maximum.
 *
 * Use {@link TimeDeltaSeconds} when the value may go negative.
 */
export type DurationSeconds = Brand<number, typeof DURATION_SECONDS_BRAND>;

/**
 * A signed difference between two instants, in seconds.
 *
 * Negative means the deadline has passed, which is why "time left" uses this and
 * not {@link DurationSeconds}.
 */
export type TimeDeltaSeconds = Brand<number, typeof TIME_DELTA_SECONDS_BRAND>;

/**
 * Unchecked cast to {@link UnixSeconds}.
 *
 * Prefer `toUnixSeconds` from `time.value.ts` — it rejects non-integers and
 * negatives first. This applies the brand and validates nothing.
 */
export const createUnixSeconds: (value: number) => UnixSeconds = createBrand<
	number,
	typeof UNIX_SECONDS_BRAND
>(UNIX_SECONDS_BRAND);

/**
 * Unchecked cast to {@link DurationSeconds}.
 *
 * Prefer `toDurationSeconds` from `time.value.ts` — it enforces the
 * non-negative rule that gives this brand its meaning.
 */
export const createDurationSeconds: (value: number) => DurationSeconds =
	createBrand<number, typeof DURATION_SECONDS_BRAND>(DURATION_SECONDS_BRAND);

/**
 * Unchecked cast to {@link TimeDeltaSeconds}.
 *
 * Only `time.value.ts` should call this; its `toTimeDeltaSeconds` wrapper is
 * private, so reach for the exported `calculateTimeLeftSec` instead.
 */
export const createTimeDeltaSeconds: (value: number) => TimeDeltaSeconds =
	createBrand<number, typeof TIME_DELTA_SECONDS_BRAND>(
		TIME_DELTA_SECONDS_BRAND,
	);
