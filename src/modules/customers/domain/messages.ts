/**
 * Centralized error messages for the server/customers layer.
 * Keeps DAL/Repo decoupled from feature-level messages.
 */
export const CUSTOMER_SERVER_ERROR_MESSAGES = {
	countInvoicesFailed: "Failed to count invoices for customer.",
	createFailed: "Failed to create customer.",
	deleteFailed: "Failed to delete customer.",
	fetchAllFailed: "Failed to fetch customers.",
	fetchFilteredFailed: "Failed to fetch filtered customers.",
	fetchTotalFailed: "Failed to fetch total customers count.",
	readFailed: "Failed to read customer.",
	updateFailed: "Failed to update customer.",
} as const;

/**
 * Feature-level messages surfaced to the user through `FormResult`.
 */
export const CUSTOMER_ERROR_MESSAGES = {
	createFailed: "Could not create the customer. Please try again.",
	deleteFailed: "Could not delete the customer. Please try again.",
	duplicateEmail: "A customer with this email address already exists.",
	notFound: "Customer not found.",
	unexpected: "Something went wrong. Please try again.",
	updateFailed: "Could not update the customer. Please try again.",
	validationFailed: "Please correct the highlighted fields.",
} as const;

export const CUSTOMER_SUCCESS_MESSAGES = {
	createSuccess: "Customer created.",
	deleteSuccess: "Customer deleted.",
	noChanges: "No changes to save.",
	updateSuccess: "Customer updated.",
} as const;

/**
 * Explains a refused delete, naming the exact number of invoices in the way.
 *
 * The count is load-bearing, not decoration: `invoices.customer_id` is declared
 * `ON DELETE CASCADE`, so without this guard the delete would silently remove
 * every one of these invoices and shift the dashboard's revenue totals with no
 * indication of why.
 */
export function customerHasInvoicesMessage(
	name: string,
	invoiceCount: number,
): string {
	const plural = invoiceCount === 1 ? "invoice" : "invoices";
	return `Cannot delete ${name} — ${invoiceCount} ${plural} reference this customer. Delete or reassign those invoices first.`;
}
