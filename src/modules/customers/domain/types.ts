import type { CustomerRow } from "@database/schema/customers";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";

/**
 * Customer field for select options.
 */
export type CustomerField = {
	id: CustomerId;
	name: string;
};

/**
 * Formatted customer table row for UI.
 */
export type FormattedCustomersTableRow = {
	id: CustomerId;
	name: string;
	email: string;
	imageUrl: string;
	totalInvoices: number;
	totalPaid: string; // Formatted currency
	totalPending: string; // Formatted currency
};

/**
 * A single customer as owned by this module.
 *
 * `sensitiveData` is deliberately absent: the column exists on the table as a
 * demo of column-level exclusion, and no read path selects it — modeling it
 * here would be the first step toward leaking it into a DTO.
 */
export type CustomerEntity = {
	id: CustomerId;
	name: string;
	email: string;
	imageUrl: string;
};

/**
 * Fields accepted when inserting a customer. `imageUrl` is set by the server
 * (there is no user-facing image field), so it is required here but never
 * sourced from form input.
 */
export type CreateCustomerProps = {
	email: string;
	imageUrl: string;
	name: string;
};

/**
 * Fields accepted when patching a customer. Every key is optional — an absent
 * key means "leave unchanged", which is what the edit form's blank inputs mean.
 */
export type UpdateCustomerProps = {
	email?: string;
	name?: string;
};

/**
 * Server DTOs returned by the repository (branded, normalized).
 * These are internal to the server layer and not feature-specific.
 */
export type CustomerSelectServerDto = {
	id: CustomerId;
	name: string;
};

export type CustomerAggregatesServerDto = {
	id: CustomerId;
	name: string;
	email: string;
	imageUrl: string;
	totalInvoices: number;
	totalPaid: number; // normalized to 0 when null in raw
	totalPending: number; // normalized to 0 when null in raw
};

/**
 * Raw DB shape for "select" options. Reflects the query selection in DAL.
 * Note: id is the raw DB type, not branded.
 */
export type CustomerSelectRowRaw = {
	id: CustomerRow["id"];
	name: CustomerRow["name"];
};

/**
 * Raw DB shape for the aggregated customers table query.
 * Totals from SUM(...) can be null when no matching rows exist.
 */
export type CustomerAggregatesRowRaw = {
	id: CustomerRow["id"];
	name: CustomerRow["name"];
	email: CustomerRow["email"];
	imageUrl: CustomerRow["imageUrl"];
	totalInvoices: number; // COUNT() returns 0, not null
	totalPaid: number | null; // SUM(...) can be null
	totalPending: number | null; // SUM(...) can be null
};
