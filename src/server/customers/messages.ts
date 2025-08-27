import "server-only";

/**
 * Centralized error messages for the server/customers layer.
 * Keeps DAL/Repo decoupled from feature-level messages.
 */
export const CUSTOMER_SERVER_ERROR_MESSAGES = {
  FETCH_ALL_FAILED: "Failed to fetch customers.",
  FETCH_FILTERED_FAILED: "Failed to fetch filtered customers.",
  FETCH_TOTAL_FAILED: "Failed to fetch total customers count.",
} as const;
