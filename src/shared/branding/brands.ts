import type { Brand } from "@/shared/branding/brand";

/**
 * Brand symbol for customer identifiers.
 */
export const CUSTOMER_ID_BRAND = Symbol("CustomerId");

/**
 * Brand symbol for invoice identifiers.
 */
export const INVOICE_ID_BRAND = Symbol("InvoiceId");

/**
 * Brand symbol for period (first day of month) timestamps.
 */
export const PERIOD_BRAND = Symbol("Period");

/**
 * Brand symbol for revenue identifiers.
 */
export const REVENUE_ID_BRAND = Symbol("RevenueId");

/**
 * Brand symbol for session identifiers.
 */
export const SESSION_ID_BRAND = Symbol("SessionId");

/**
 * Brand symbol for user identifiers.
 */
export const USER_ID_BRAND = Symbol("UserId");

/**
 * Branded customer identifier (UUID string).
 */
export type CustomerId = Brand<string, typeof CUSTOMER_ID_BRAND>;

/**
 * Branded invoice identifier (UUID string).
 */
export type InvoiceId = Brand<string, typeof INVOICE_ID_BRAND>;

/**
 * Branded period (first day of month, UTC Date).
 */
export type Period = Brand<Date, typeof PERIOD_BRAND>;

/**
 * Branded revenue identifier (UUID string).
 */
export type RevenueId = Brand<string, typeof REVENUE_ID_BRAND>;

/**
 * Branded session identifier (UUID string).
 */
export type SessionId = Brand<string, typeof SESSION_ID_BRAND>;

/**
 * Branded user identifier (UUID string).
 */
export type UserId = Brand<string, typeof USER_ID_BRAND>;
