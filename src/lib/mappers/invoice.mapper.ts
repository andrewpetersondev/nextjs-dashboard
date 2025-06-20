import type { InvoiceEntity } from "@/src/lib/db/entities/invoice";
import {
	INVOICE_STATUSES,
	type InvoiceStatus,
} from "@/src/lib/definitions/enums";
import type {
	CustomerId,
	InvoiceByIdDbRow,
	InvoiceId,
} from "@/src/lib/definitions/invoices";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto";

/**
 * Helper to brand a string as InvoiceId.
 */
export const toInvoiceId = (id: string): InvoiceId => id as InvoiceId;

/**
 * Helper to brand a string as CustomerId.
 */
export const toCustomerId = (id: string): CustomerId => id as CustomerId;

/**
 * Maps a raw database row to an InvoiceEntity.
 * Ensures type safety by branding IDs and validating status.
 *
 * @param row - The raw database row representing an invoice.
 * @returns An InvoiceEntity with branded types and validated status.
 * @throws Error if status is invalid.
 */
export function toInvoiceEntity(row: InvoiceByIdDbRow): InvoiceEntity {
	if (!INVOICE_STATUSES.includes(row.status as InvoiceStatus)) {
		throw new Error(`Invalid status value: ${row.status}`);
	}

	return {
		amount: row.amount,
		customerId: toCustomerId(row.customerId),
		date: row.date,
		id: toInvoiceId(row.id),
		status: row.status as InvoiceStatus, // Cast after validation
	};
}

/**
 * Converts an InvoiceEntity to an InvoiceDTO for API responses.
 * Strips branding from IDs and preserves all other fields.
 *
 * @param invoice - The InvoiceEntity instance to convert.
 * @returns An InvoiceDTO instance with plain types.
 */
export function toInvoiceDTO(invoice: InvoiceEntity): InvoiceDTO {
	return {
		amount: invoice.amount,
		customerId: invoice.customerId,
		date: invoice.date,
		id: invoice.id,
		status: invoice.status,
	};
}
