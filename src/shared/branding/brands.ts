import type { Brand } from "@/shared/branding/brand";

export const CUSTOMER_ID_BRAND = Symbol("CustomerId");
export const USER_ID_BRAND = Symbol("UserId");
export const INVOICE_ID_BRAND = Symbol("InvoiceId");
export const REVENUE_ID_BRAND = Symbol("RevenueId");
export const SESSION_ID_BRAND = Symbol("SessionId");
export const PERIOD_BRAND = Symbol("Period");

export type CustomerId = Brand<string, typeof CUSTOMER_ID_BRAND>;
export type UserId = Brand<string, typeof USER_ID_BRAND>;
export type InvoiceId = Brand<string, typeof INVOICE_ID_BRAND>;
export type RevenueId = Brand<string, typeof REVENUE_ID_BRAND>;
export type SessionId = Brand<string, typeof SESSION_ID_BRAND>;
export type Period = Brand<Date, typeof PERIOD_BRAND>;
