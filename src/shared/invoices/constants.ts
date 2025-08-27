// Magic Numbers (amounts shown to users are USD; we persist cents)
const _MIN_INVOICE_AMOUNT_CENTS = 1; // 1 cent
const _MAX_INVOICE_AMOUNT_CENTS = 1_000_000; // $10,000 = 1,000,000 cents
export const MIN_INVOICE_AMOUNT_USD = 0.01; // 1 cent
export const MAX_INVOICE_AMOUNT_USD = 10_000; // $10,000
export const MIN_SENSITIVE_DATA_LENGTH = 2;
export const MAX_SENSITIVE_DATA_LENGTH = 100;

// "YYYY-MM-DD"
export const ISO_YEAR_MONTH_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// "YYYY-MM"
export const ISO_YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;
