import { INVOICE_STATUSES as DB_INVOICE_STATUSES } from "@database/schema/schema.constants";

/**
 * Every status an invoice may be stored with.
 *
 * Aliased from the DB schema constant rather than re-declared, so the domain
 * vocabulary and the Postgres enum cannot drift — they were two parallel
 * definitions before 2026-08-03. Note this is an alias, not a re-export.
 */
export const INVOICE_STATUSES: typeof DB_INVOICE_STATUSES = DB_INVOICE_STATUSES;

/** Union of {@link INVOICE_STATUSES}. Excludes "overdue", which is derived, never stored. */
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Statuses a *new* invoice may be created with.
 *
 * "void" is transition-only: reachable from "pending" but never chosen at
 * creation. The create schema narrows to this subset so a hand-crafted POST
 * cannot void an invoice into existence — the radio group hiding the option is
 * UI, not enforcement.
 */
export const CREATABLE_INVOICE_STATUSES: readonly ["pending", "paid"] = [
	"pending",
	"paid",
] as const satisfies readonly InvoiceStatus[];

/** Union of {@link CREATABLE_INVOICE_STATUSES} — a strict subset of {@link InvoiceStatus}. */
export type CreatableInvoiceStatus =
	(typeof CREATABLE_INVOICE_STATUSES)[number];
