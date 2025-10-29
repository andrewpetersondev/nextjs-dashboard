import "server-only";

/**
 * Centralized error messages for the server/customers layer.
 * Keeps DAL/Repo decoupled from feature-level messages.
 */
export const CUSTOMER_SERVER_ERROR_MESSAGES = {
  fetchAllFailed: "Failed to fetch customers.",
  fetchFilteredFailed: "Failed to fetch filtered customers.",
  fetchTotalFailed: "Failed to fetch total customers count.",
} as const;
