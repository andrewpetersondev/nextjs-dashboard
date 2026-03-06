export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const DEFAULT_USER_ROLE: UserRole = "USER";
export const ADMIN_ROLE: UserRole = "ADMIN";
export const GUEST_ROLE: UserRole = "GUEST";
export const USER_ROLE: UserRole = "USER";

export const REVENUE_SOURCES = [
	"seed",
	"handler",
	"invoice_event",
	"rolling_calculation",
	"template",
] as const;

export type RevenueSource = (typeof REVENUE_SOURCES)[number];

export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
