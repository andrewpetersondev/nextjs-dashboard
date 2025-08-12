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
  FETCH_TOTAL_PAID_FAILED:
    "Failed to fetch the total amount of pending invoices.",
  FETCH_TOTAL_PENDING_FAILED:
    "Failed to fetch the total amount of pending invoices.",
  INVALID_ID: "Invalid invoice ID provided.",
  INVALID_INPUT: "Invalid input. Failed to create invoice.",
  MAPPING_FAILED: "Failed to map invoice data.",
  MISSING_FIELDS: "Missing required fields.",
  NOT_FOUND: "Invoice not found.",
  READ_FAILED: "Failed to read invoice.",
  REPO_ERROR: "Invoice Repository Error. Please try again.",
  SERVICE_ERROR: "Invoice Service Error. Please try again.",
  STATUS_REQUIRED: "Status is required.",
  TRANSFORMATION_FAILED: "Failed to transform invoice data.",
  UPDATE_FAILED: "Failed to update invoice.",
  VALIDATION_FAILED: "Validation failed. Please check your input.",
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
  READ_FAILED: "Failed to read user data.",
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
  ERROR_FETCH_TOTAL_CUSTOMERS: "Failed to fetch total customers.",
  ERROR_FETCH_TOTAL_INVOICES_COUNT: "Failed to fetch total invoices count.",
  ERROR_FETCH_TOTAL_INVOICES_PAGES: "Failed to fetch total invoice pages.",
  ERROR_FETCH_TOTAL_REVENUE: "Failed to fetch total revenue.",
  ERROR_FETCH_TOTAL_USERS: "Failed to fetch total users.",
  ERROR_INVALID_INPUT: "Invalid input. Please check your data.",
  ERROR_UNEXPECTED: "An unexpected error occurred. Please try again later.",
  ERROR_VALIDATION_FAILED: "Validation failed. Please check your data.",
};

export const CUSTOMER_ERROR_MESSAGES = {
  CREATE_FAILED: "Failed to create customer.",
  DELETE_FAILED: "Failed to delete customer.",
  FETCH_ALL_FAILED: "Failed to fetch all customers.",
  FETCH_FILTERED_FAILED: "Failed to fetch filtered customers.",
  FETCH_LATEST_FAILED: "Failed to fetch latest customers.",
  FETCH_PAGES_FAILED: "Failed to fetch total number of customer pages.",
  FETCH_TOTAL_FAILED: "Failed to fetch total customers.",
  INVALID_INPUT: "Invalid input. Please check your data.",
  NOT_FOUND: "Customer not found.",
  READ_FAILED: "Failed to read customer.",
  UPDATE_FAILED: "Failed to update customer.",
};

export const FORM_ERROR_MESSAGES = {
  INVALID_FORM_DATA: "Invalid form data. Please check your input.",
  MISSING_REQUIRED_FIELDS: "Please fill out all required fields.",
  SUBMIT_FAILED: "Form submission failed. Please try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
  VALIDATION_FAILED: "Form validation failed. Please check your input.",
};

export const REVENUE_ERROR_MESSAGES = {
  ALREADY_EXISTS: "Revenue data for the specified year already exists.",
  CALCULATION_ERROR: "Error calculating revenue for the specified year.",
  CHART_DATA_ERROR: "Error fetching revenue data for chart display.",
  CREATION_FAILED: "Failed to create revenue data.",
  DB_ERROR: "Database error occurred while processing revenue data.",
  DELETE_FAILED: "Failed to delete revenue data.",
  FETCH_ERROR: "Error fetching revenue data for the specified year.",
  FETCH_FAILED: "Failed to fetch revenue data.",
  INVALID_ID: "Invalid revenue ID provided.",
  INVALID_INPUT: "Invalid input for revenue operations.",
  INVALID_YEAR: "Invalid year parameter provided.",
  MAPPING_ERROR: "Error mapping revenue data to DTO.",
  MISSING_FIELDS: "Missing required fields for revenue operations.",
  NO_REVENUE_DATA: "No revenue data are available for the specified year.",
  NOT_DELETED: "Revenue data was not deleted successfully.",
  NOT_FOUND: "Revenue data aren't found for the specified year.",
  NOT_UPDATED: "Revenue data was not updated successfully.",
  PARAMETER_ERROR: "Invalid parameters provided for revenue operations.",
  READ_FAILED: "Failed to read revenue data.",
  RECALCULATION_FAILED: "Failed to recalculate revenue.",
  REPO_ERROR: "Repository error occurred while processing revenue data.",
  SERVICE_ERROR: "Service error occurred while processing revenue data.",
  SORTING_ERROR: "Error sorting revenue data by month.",
  TRANSFORMATION_ERROR: "Error transforming revenue data.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
  UPDATE_FAILED: "Failed to update revenue data.",
  VALIDATION_FAILED: "Validation failed. Please check your input.",
  YEAR_NOT_FOUND: "Revenue data for the specified year not found.",
  YEAR_REQUIRED: "Year is required for revenue operations.",
};

/**
 * Default Form validation messages.
 */
export const FORM_VALIDATION_ERROR_MESSAGES = {
  FAILED_VALIDATION: "Failed to validate form data.",
};
