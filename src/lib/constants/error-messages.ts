/**
 * Centralized error messages for invoice actions and DAL.
 * Update here to propagate changes throughout the app.
 */
export const INVOICE_ERROR_MESSAGES = {
  AMOUNT_REQUIRED: "Amount is required.",
  CREATE_FAILED: "Failed to create invoice.",
  CUSTOMER_ID_REQUIRED: "Customer ID is required.",
  DB_ERROR: "Database Error. Please try again.",
  DELETE_FAILED: "Failed to delete invoice.",
  FETCH_FAILED: "Database Error. Failed to Fetch InvoiceEntity.",
  FETCH_FILTERED_FAILED: "Failed to fetch filtered invoices.",
  FETCH_LATEST_FAILED: "Failed to fetch the latest invoices.",
  FETCH_PAGES_FAILED: "Failed to fetch the total number of invoice pages.",
  INVALID_INPUT: "Invalid input. Failed to create invoice.",
  MISSING_FIELDS: "Missing required fields.",
  READ_FAILED: "Failed to read invoice.",
  STATUS_REQUIRED: "Status is required.",
  UPDATE_FAILED: "Failed to update invoice.",
};

/**
 * Centralized error messages for user actions and DAL.
 */
export const USER_ERROR_MESSAGES = {
  CREATE_FAILED: "Failed to create an account. Please try again.",
  CREATE_SUCCESS: "User created successfully.",
  DELETE_FAILED: "User not found or could not be deleted.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  NO_CHANGES: "No changes to update.",
  NOT_FOUND: "User not found.",
  NOT_FOUND_OR_DELETE_FAILED: "User not found or could not be deleted.",
  UNEXPECTED: "An unexpected error occurred. Please try again.",
  UPDATE_FAILED: "Failed to update user. Please try again.",
  UPDATE_SUCCESS: "Profile updated!",
  VALIDATION_FAILED: "Validation failed. Please check your input.",
};

/**
 * Centralized error messages for data.dal.ts operations.
 */
export const DATA_ERROR_MESSAGES = {
  ERROR_FETCH_DASHBOARD_CARDS: "Failed to fetch dashboard cards.",
  ERROR_FETCH_LATEST_INVOICES: "Failed to fetch latest invoices.",
  ERROR_FETCH_REVENUE: "Failed to fetch revenue data.",
};
