// Magic Numbers (amounts shown to users are USD; we persist cents)
export const MAX_INVOICE_AMOUNT_USD = 10_000; // $10,000
export const MIN_SENSITIVE_DATA_LENGTH = 2;
export const MAX_SENSITIVE_DATA_LENGTH = 100;

// "YYYY-MM"
export const ISO_YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;

export const ITEMS_PER_PAGE_INVOICES = 10;
