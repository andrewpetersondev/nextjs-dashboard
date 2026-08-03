import { INVOICE_STATUSES as DB_INVOICE_STATUSES } from "@database/schema/schema.constants";

// Single source of truth: the DB schema constant. Aliasing (not a re-export)
// keeps the domain vocabulary and the Postgres enum from drifting apart —
// they were two parallel definitions before 2026-08-03.
export const INVOICE_STATUSES: typeof DB_INVOICE_STATUSES = DB_INVOICE_STATUSES;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// Statuses a NEW invoice may be recorded with. "void" is transition-only:
// it can be reached from "pending" but never chosen at creation.
export const CREATABLE_INVOICE_STATUSES: readonly ["pending", "paid"] = [
	"pending",
	"paid",
] as const satisfies readonly InvoiceStatus[];
export type CreatableInvoiceStatus =
	(typeof CREATABLE_INVOICE_STATUSES)[number];
