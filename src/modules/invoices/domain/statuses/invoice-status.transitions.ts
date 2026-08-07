import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * The invoice lifecycle: pending → paid, pending → void; paid and void are
 * terminal. "void" (not delete) preserves the record for reporting — see the
 * module README. "overdue" never appears here: it is a derived display state
 * of "pending", not a stored status.
 *
 * Module-private on purpose: the table is the implementation, and the three
 * functions below are the surface. Reading it directly would let a caller
 * bypass the `from === to` no-op rule that `canTransitionInvoiceStatus` adds.
 */
const INVOICE_STATUS_TRANSITIONS: Readonly<
	Record<InvoiceStatus, readonly InvoiceStatus[]>
> = {
	paid: [],
	pending: ["paid", "void"],
	void: [],
};

export function allowedNextInvoiceStatuses(
	from: InvoiceStatus,
): readonly InvoiceStatus[] {
	return INVOICE_STATUS_TRANSITIONS[from];
}

/**
 * `from === to` is an allowed no-op: the edit form may re-submit the current
 * status, and rejecting "pending→pending" would break every unchanged save.
 */
export function canTransitionInvoiceStatus(
	from: InvoiceStatus,
	to: InvoiceStatus,
): boolean {
	return from === to || INVOICE_STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Result-returning guard for the update path.
 * Uses the "validation" error kind: "conflict" metadata requires a pgCode,
 * which a domain rule cannot honestly supply.
 */
export function validateInvoiceStatusTransition(
	from: InvoiceStatus,
	to: InvoiceStatus,
): Result<InvoiceStatus, AppError> {
	if (canTransitionInvoiceStatus(from, to)) {
		return Ok(to);
	}
	return Err(
		makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: INVOICE_MSG.invalidStatusTransition,
			metadata: {
				policy: "invoice-status-transition",
				reason: `${from}->${to}`,
			},
		}),
	);
}
