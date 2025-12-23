/**
 * Converters for branded IDs and Period values.
 *
 * This module exports two kinds of helpers:
 * - Result-returning converters (thin wrappers over factory functions). Use these in domain/library code
 *   for explicit, composable error handling.
 * - Throwing adapters (implemented via the Result converters). Use these sparingly at application
 *   boundaries (HTTP handlers, CLI entrypoints) where throwing and try/catch are convenient.
 *
 * The factories and types are provided by `@/shared/branding/domain-brands` and errors use `AppError`.
 *
 * See also: `toCustomerIdResult` / `toCustomerId` pattern used below.
 */

import type {
  CustomerId,
  InvoiceId,
  Period,
  RevenueId,
  SessionId,
  UserId,
} from "@/shared/branding/brands";
import {
  createCustomerId,
  createInvoiceId,
  createRevenueId,
  createSessionId,
  createUserId,
} from "@/shared/branding/factories/id-factories";
import { createPeriod } from "@/shared/branding/factories/period-factory";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { Result } from "@/shared/result/result.types";

/**
 * Validate and convert an arbitrary value into a branded `CustomerId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<CustomerId, AppError>` where `ok: true` contains the branded id,
 *          and `ok: false` contains an `AppError` describing the failure.
 *
 * @example
 * const r = toCustomerIdResult(someValue);
 * if (r.ok) { // use r.value }
 */
export const toCustomerIdResult = (
  value: unknown,
): Result<CustomerId, AppError> => createCustomerId(value);

/**
 * Validate and convert an arbitrary value into a branded `InvoiceId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<InvoiceId, AppError>` representing success or an `AppError`.
 */
export const toInvoiceIdResult = (
  value: unknown,
): Result<InvoiceId, AppError> => createInvoiceId(value);

/**
 * Normalize and validate an input into a branded `Period`.
 *
 * Accepts `Date | string` input in the factory; the result indicates success or an `AppError`.
 *
 * @param value - The input value to normalize and validate.
 * @returns A `Result<Period, AppError>` representing success or an `AppError`.
 */
export const toPeriodResult = (value: unknown): Result<Period, AppError> =>
  createPeriod(value);

/**
 * Validate and convert an arbitrary value into a branded `RevenueId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<RevenueId, AppError>` representing success or an `AppError`.
 */
export const toRevenueIdResult = (
  value: unknown,
): Result<RevenueId, AppError> => createRevenueId(value);

/**
 * Validate and convert an arbitrary value into a branded `SessionId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<SessionId, AppError>` representing success or an `AppError`.
 */
export const toSessionIdResult = (
  value: unknown,
): Result<SessionId, AppError> => createSessionId(value);

/**
 * Validate and convert an arbitrary value into a branded `UserId`.
 *
 * @param value - The input value to validate and convert.
 * @returns A `Result<UserId, AppError>` representing success or an `AppError`.
 */
export const toUserIdResult = (value: unknown): Result<UserId, AppError> =>
  createUserId(value);

/**
 * Validate and convert a string to a branded `CustomerId`.
 *
 * This is a thin throwing adapter over `toCustomerIdResult`. It throws the underlying `AppError`
 * when validation fails. Prefer the `Result`-returning converter in domain code; use this
 * adapter only at application boundaries.
 *
 * @param id - The input string to convert.
 * @returns The branded `CustomerId` when validation succeeds.
 * @throws {AppError} When validation fails.
 *
 * @example
 * try {
 *   const customerId = toCustomerId(req.params.id);
 * } catch (err) {
 *   // err is AppError
 * }
 */
export const toCustomerId = (id: string): CustomerId => {
  const r = toCustomerIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Validate and convert a string to a branded `InvoiceId`.
 *
 * @param id - The input string to convert.
 * @returns The branded `InvoiceId` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export const toInvoiceId = (id: string): InvoiceId => {
  const r = toInvoiceIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Normalize an input into a branded `Period`.
 *
 * This throwing adapter wraps `toPeriodResult`. It accepts `Date | string` and throws an `AppError`
 * when normalization/validation fails.
 *
 * @param input - The input `Date` or `string` to normalize.
 * @returns The branded `Period` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export function toPeriod(input: Date | string): Period {
  const r = toPeriodResult(input);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}

/**
 * Validate and convert a string to a branded `RevenueId`.
 *
 * @param id - The input string to convert.
 * @returns The branded `RevenueId` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export const toRevenueId = (id: string): RevenueId => {
  const r = toRevenueIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};

/**
 * Validate and convert a string to a branded `UserId`.
 *
 * @param id - The input string to convert.
 * @returns The branded `UserId` when validation succeeds.
 * @throws {AppError} When validation fails.
 */
export const toUserId = (id: string): UserId => {
  const r = toUserIdResult(id);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
