import { type Brand, createBrand, validateUuidResult } from "@/lib/core/brands";
import { Err, Ok, type Result } from "@/lib/core/result.base";
import { ValidationError_New } from "@/lib/errors/error.domain";
import { ValidationError } from "@/lib/errors/errors";
import { brandWith } from "@/lib/validation/types";

// Unique symbols for each domain concept
const CUSTOMER_ID_BRAND = Symbol("CustomerId");
const USER_ID_BRAND = Symbol("UserId");
const INVOICE_ID_BRAND = Symbol("InvoiceId");
const REVENUE_ID_BRAND = Symbol("RevenueId");
const SESSION_ID_BRAND = Symbol("SessionId");
const PERIOD_BRAND = Symbol("Period");

// Symbol-constrained branded types
export type CustomerId = Brand<string, typeof CUSTOMER_ID_BRAND>;
export type UserId = Brand<string, typeof USER_ID_BRAND>;
export type InvoiceId = Brand<string, typeof INVOICE_ID_BRAND>;
export type RevenueId = Brand<string, typeof REVENUE_ID_BRAND>;
export type SessionId = Brand<string, typeof SESSION_ID_BRAND>;
export type Period = Brand<Date, typeof PERIOD_BRAND>;

// Factory: explicitly bind base type and brand symbol to avoid inference issues
const brandUserId = createBrand<string, typeof USER_ID_BRAND>(USER_ID_BRAND);

// Compose a validator that returns ValidationError_New using your UUID validator
const validateUserIdNew = (
  value: unknown,
): Result<string, ValidationError_New> => {
  const r = validateUuidResult(value, "UserId"); // Result<string, ValidationError>
  return r.success ? Ok(r.data) : Err(new ValidationError_New(r.error.message));
};

// Compose validation + branding with brandWith (Result<UserId, ValidationError_New>)
const createUserIdNew = brandWith<string, UserId>(
  validateUserIdNew,
  brandUserId,
);

// Public API: keep the original error type (ValidationError) for callers
export const createUserId = (
  value: string,
): Result<UserId, ValidationError> => {
  const r = createUserIdNew(value);
  return r.success ? Ok(r.data) : Err(new ValidationError(r.error.message));
};
