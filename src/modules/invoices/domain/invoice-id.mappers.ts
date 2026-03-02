import { createInvoiceId } from "@/modules/invoices/domain/invoice-id.factory";
import type { InvoiceId } from "@/modules/invoices/domain/types/invoice-id.brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";

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
