import { format, isValid, parse } from "date-fns";
import {
  type Brand,
  createBrand,
  isUuid,
  UUID_REGEX,
  validatePeriodResult,
  validateUuid,
  validateUuidResult,
} from "@/lib/core/brands";
import { Err, Ok, type Result } from "@/lib/core/result.base";
import { ValidationError_New } from "@/lib/errors/error.domain";
import { ValidationError } from "@/lib/errors/errors";
import {
  isValidDate,
  normalizeToFirstOfMonthUTC,
} from "@/lib/utils/date.utils";
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

// Generic helpers to reduce duplication

export const mapNewToLegacyError = <T>(
  r: Result<T, ValidationError_New>,
): Result<T, ValidationError> =>
  r.success ? Ok(r.data) : Err(new ValidationError(r.error.message));

export const uuidValidatorFor =
  (label: string) =>
  (value: unknown): Result<string, ValidationError_New> => {
    const r = validateUuidResult(value, label);
    return r.success
      ? Ok(r.data)
      : Err(new ValidationError_New(r.error.message));
  };

export const periodValidator = (
  value: unknown,
): Result<Date, ValidationError_New> => {
  const r = validatePeriodResult(value);
  return r.success ? Ok(r.data) : Err(new ValidationError_New(r.error.message));
};

// Factory: explicitly bind base type and brand symbol to avoid inference issues

// Factories: explicitly bind base type and brand symbol to avoid inference issues

const brandCustomerId = createBrand<string, typeof CUSTOMER_ID_BRAND>(
  CUSTOMER_ID_BRAND,
);

const brandUserId = createBrand<string, typeof USER_ID_BRAND>(USER_ID_BRAND);

const brandInvoiceId = createBrand<string, typeof INVOICE_ID_BRAND>(
  INVOICE_ID_BRAND,
);

const brandRevenueId = createBrand<string, typeof REVENUE_ID_BRAND>(
  REVENUE_ID_BRAND,
);

const brandSessionId = createBrand<string, typeof SESSION_ID_BRAND>(
  SESSION_ID_BRAND,
);

const brandPeriod = createBrand<Date, typeof PERIOD_BRAND>(PERIOD_BRAND);

// Compose validation + branding generically using brandWith()
// UUID-based brands

const createCustomerIdInternal = brandWith<string, CustomerId>(
  uuidValidatorFor("CustomerId"),
  brandCustomerId,
);

const createUserIdInternal = brandWith<string, UserId>(
  uuidValidatorFor("UserId"),
  brandUserId,
);

const createInvoiceIdInternal = brandWith<string, InvoiceId>(
  uuidValidatorFor("InvoiceId"),
  brandInvoiceId,
);

const createRevenueIdInternal = brandWith<string, RevenueId>(
  uuidValidatorFor("RevenueId"),
  brandRevenueId,
);

const createSessionIdInternal = brandWith<string, SessionId>(
  uuidValidatorFor("SessionId"),
  brandSessionId,
);

// Date-based brand (Period)
const createPeriodInternal = brandWith<Date, Period>(
  periodValidator,
  brandPeriod,
);

// Public API: keep the original error type expected by callers

export const createCustomerId = (
  value: unknown,
): Result<CustomerId, ValidationError> =>
  mapNewToLegacyError(createCustomerIdInternal(value));

export const createUserId = (value: unknown): Result<UserId, ValidationError> =>
  mapNewToLegacyError(createUserIdInternal(value));

export const createInvoiceId = (
  value: unknown,
): Result<InvoiceId, ValidationError> =>
  mapNewToLegacyError(createInvoiceIdInternal(value));

export const createRevenueId = (
  value: unknown,
): Result<RevenueId, ValidationError> =>
  mapNewToLegacyError(createRevenueIdInternal(value));

export const createSessionId = (
  value: unknown,
): Result<SessionId, ValidationError> =>
  mapNewToLegacyError(createSessionIdInternal(value));

export const createPeriod = (value: unknown): Result<Period, ValidationError> =>
  mapNewToLegacyError(createPeriodInternal(value));

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
export const createUserId_Legacy = (
  value: string,
): Result<UserId, ValidationError> => {
  const r = createUserIdNew(value);
  return r.success ? Ok(r.data) : Err(new ValidationError(r.error.message));
};

export function isUserIdSafe(value: unknown): value is UserId {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Validates and converts a string to a branded CustomerId
 * @param id - The UUID string to validate
 * @returns A branded CustomerId
 * @throws {ValidationError} If the ID is invalid
 */
export const toCustomerId = (id: string): CustomerId => {
  validateUuid(id, "CustomerId");
  return id as CustomerId;
};
/**
 * Validates and converts a string to a branded UserId
 * @param id - The UUID string to validate
 * @returns A branded UserId
 * @throws {ValidationError} If the ID is invalid
 */
export const toUserId = (id: string): UserId => {
  validateUuid(id, "UserId");
  return id as UserId;
};
/**
 * Validates and converts a string to a branded InvoiceId
 * @param id - The UUID string to validate
 * @returns A branded InvoiceId
 * @throws {ValidationError} If the ID is invalid
 */
export const toInvoiceId = (id: string): InvoiceId => {
  validateUuid(id, "InvoiceId");
  return id as InvoiceId;
};
/**
 * Validates and converts a string to a branded RevenueId
 * @param id - The UUID string to validate
 * @returns A branded RevenueId
 * @throws {ValidationError} If the ID is invalid
 */
export const toRevenueId = (id: string): RevenueId => {
  validateUuid(id, "RevenueId");
  return id as RevenueId;
};
/**
 * Validates and converts a string to a branded SessionId
 * @param id - The UUID string to validate
 * @returns A branded SessionId
 * @throws {ValidationError} If the ID is invalid
 */
export const toSessionId = (id: string): SessionId => {
  validateUuid(id, "SessionId");
  return id as SessionId;
};

/**
 * Normalizes an input into a branded Period (first-of-month Date in UTC)
 * @param input - Date object, "yyyy-MM", or "yyyy-MM-dd" string
 * @returns A branded Period representing the first day of the month
 * @throws {ValidationError} If the input cannot be parsed or normalized
 */
export function toPeriod(input: Date | string): Period {
  if (input instanceof Date) {
    if (!isValidDate(input)) {
      throw new ValidationError("Invalid Date provided for period conversion");
    }
    return normalizeToFirstOfMonthUTC(input) as Period;
  }

  if (typeof input === "string") {
    // Try yyyy-MM format first
    let parsed = parse(input, "yyyy-MM", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM") === input) {
      return normalizeToFirstOfMonthUTC(parsed) as Period;
    }

    // Try yyyy-MM-dd format (must be first day of month)
    parsed = parse(input, "yyyy-MM-dd", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM-dd") === input) {
      if (parsed.getUTCDate() !== 1) {
        throw new ValidationError(
          `Period date must be the first day of the month, got: "${input}"`,
        );
      }
      return normalizeToFirstOfMonthUTC(parsed) as Period;
    }

    throw new ValidationError(
      `Invalid period format: "${input}". Expected "yyyy-MM" or "yyyy-MM-01"`,
    );
  }

  throw new ValidationError(
    `Unsupported period input type: ${typeof input}. Expected Date or string`,
  );
}

/**
 * Type guard to check if a value is a valid CustomerId
 * @param value - The value to check
 * @returns True if the value is a valid CustomerId
 */
export function isCustomerId(value: unknown): value is CustomerId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid UserId
 * @param value - The value to check
 * @returns True if the value is a valid UserId
 */
export function isUserId(value: unknown): value is UserId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid InvoiceId
 * @param value - The value to check
 * @returns True if the value is a valid InvoiceId
 */
export function isInvoiceId(value: unknown): value is InvoiceId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid RevenueId
 * @param value - The value to check
 * @returns True if the value is a valid RevenueId
 */
export function isRevenueId(value: unknown): value is RevenueId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid SessionId
 * @param value - The value to check
 * @returns True if the value is a valid SessionId
 */
export function isSessionId(value: unknown): value is SessionId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid Period (first-of-month Date)
 * @param value - The value to check
 * @returns True if the value is a valid Period
 */
export function isPeriod(value: unknown): value is Period {
  return value instanceof Date && isValid(value) && value.getUTCDate() === 1;
}
