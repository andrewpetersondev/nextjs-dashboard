import type { ErrorCode } from "./error-codes";

export const DATA_ERROR_MESSAGES = {
  ERROR_FETCH_DASHBOARD_CARDS: "Failed to fetch dashboard cards.",
  ERROR_FETCH_LATEST_INVOICES: "Failed to fetch latest invoices.",
  ERROR_FETCH_REVENUE: "Failed to fetch revenue data.",
  ERROR_FETCH_TOTAL_CUSTOMERS: "Failed to fetch total customers.",
  ERROR_FETCH_TOTAL_INVOICES_COUNT: "Failed to fetch total invoices count.",
  ERROR_FETCH_TOTAL_INVOICES_PAGES: "Failed to fetch total invoice pages.",
  ERROR_FETCH_TOTAL_REVENUE: "Failed to fetch total revenue.",
  ERROR_FETCH_TOTAL_USERS: "Failed to fetch total users.",
  ERROR_INVALID_INPUT: "Invalid input. Please check your data.",
  ERROR_UNEXPECTED: "An unexpected error occurred. Please try again later.",
  ERROR_VALIDATION_FAILED: "Validation failed. Please check your data.",
} as const;

export const FRIENDLY_ERROR_MESSAGES: Partial<Record<ErrorCode, string>> = {
  INTERNAL: "Something went wrong. Please try again.",
  UNKNOWN: "An unexpected error occurred.",
};

export const GENERIC_ERROR_MESSAGE = "Internal server error" as const;
