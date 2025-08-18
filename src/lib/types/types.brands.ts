import type { Brand } from "@/lib/core/brands";

// Centralized brand symbols
export const customerIdBrand = Symbol("CustomerId");
export const userIdBrand = Symbol("UserId");
export const invoiceIdBrand = Symbol("InvoiceId");
export const revenueIdBrand = Symbol("RevenueId");
export const sessionIdBrand = Symbol("SessionId");
export const periodBrand = Symbol("Period");

// Branded types
export type CustomerId = Brand<string, typeof customerIdBrand>;
export type UserId = Brand<string, typeof userIdBrand>;
export type InvoiceId = Brand<string, typeof invoiceIdBrand>;
export type RevenueId = Brand<string, typeof revenueIdBrand>;
export type SessionId = Brand<string, typeof sessionIdBrand>;
export type Period = Brand<Date, typeof periodBrand>;
