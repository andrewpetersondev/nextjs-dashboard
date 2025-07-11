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
  INVALID_INPUT: "Invalid input. Failed to create invoice.",
  MISSING_FIELDS: "Missing required fields.",
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
