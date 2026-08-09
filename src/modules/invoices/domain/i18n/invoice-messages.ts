/**
 * Every user-facing message the invoices module can emit, as stable IDs.
 *
 * Keeps English out of domain and application code: those layers select an ID,
 * and only `en-invoices.ts` knows what it says.
 */
export const INVOICE_MSG = {
	amountRequired: "INVOICE.AMOUNT_REQUIRED",
	createFailed: "INVOICE.CREATE_FAILED",
	createSuccess: "INVOICE.CREATE_SUCCESS",
	customerIdRequired: "INVOICE.CUSTOMER_ID_REQUIRED",
	dbError: "INVOICE.DB_ERROR",
	deleteFailed: "INVOICE.DELETE_FAILED",
	deleteSuccess: "INVOICE.DELETE_SUCCESS",
	fetchAllSuccess: "INVOICE.FETCH_ALL_SUCCESS",
	fetchFailed: "INVOICE.FETCH_FAILED",
	fetchFilteredFailed: "INVOICE.FETCH_FILTERED_FAILED",
	fetchFilteredSuccess: "INVOICE.FETCH_FILTERED_SUCCESS",
	fetchLatestFailed: "INVOICE.FETCH_LATEST_FAILED",
	fetchLatestSuccess: "INVOICE.FETCH_LATEST_SUCCESS",
	fetchPagesFailed: "INVOICE.FETCH_PAGES_FAILED",
	fetchPagesSuccess: "INVOICE.FETCH_PAGES_SUCCESS",
	fetchTotalPaidFailed: "INVOICE.FETCH_TOTAL_PAID_FAILED",
	fetchTotalPendingFailed: "INVOICE.FETCH_TOTAL_PENDING_FAILED",
	invalidFormData: "INVOICE.INVALID_FORM_DATA",
	invalidId: "INVOICE.INVALID_ID",
	invalidInput: "INVOICE.INVALID_INPUT",
	invalidStatusTransition: "INVOICE.INVALID_STATUS_TRANSITION",
	listSuccess: "INVOICE.LIST_SUCCESS",
	mappingFailed: "INVOICE.MAPPING_FAILED",
	missingFields: "INVOICE.MISSING_FIELDS",
	notFound: "INVOICE.NOT_FOUND",
	readFailed: "INVOICE.READ_FAILED",
	readSuccess: "INVOICE.READ_SUCCESS",
	repoError: "INVOICE.REPO_ERROR",
	serviceError: "INVOICE.SERVICE_ERROR",
	statusConflict: "INVOICE.STATUS_CONFLICT",
	statusRequired: "INVOICE.STATUS_REQUIRED",
	transformationFailed: "INVOICE.TRANSFORMATION_FAILED",
	updateFailed: "INVOICE.UPDATE_FAILED",
	updateSuccess: "INVOICE.UPDATE_SUCCESS",
	validationFailed: "INVOICE.VALIDATION_FAILED",
} as const;

/**
 * The union of every value in {@link INVOICE_MSG}.
 *
 * Derived from the registry so the two cannot drift — adding an entry widens
 * this union, and `en-invoices.ts` then fails to compile until it is translated.
 */
export type InvoiceMessageId = (typeof INVOICE_MSG)[keyof typeof INVOICE_MSG];
