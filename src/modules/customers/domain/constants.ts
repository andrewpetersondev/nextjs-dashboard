/**
 * Shared label constants for customer-related UI.
 */
export const CUSTOMER_LABELS = {
	invoices: "Invoices",
	paid: "Paid",
	pending: "Pending",
} as const;

/**
 * Shared header labels for the customers table.
 */
export const CUSTOMER_TABLE_HEADERS = {
	actions: "Actions",
	email: "Email",
	name: "Name",
	totalInvoices: `Total ${CUSTOMER_LABELS.invoices}`,
	totalPaid: `Total ${CUSTOMER_LABELS.paid}`,
	totalPending: `Total ${CUSTOMER_LABELS.pending}`,
} as const;

/**
 * Labels for the customer write forms.
 */
export const CUSTOMER_FORM_LABELS = {
	cancel: "Cancel",
	create: "Create Customer",
	createHeading: "Create Customer",
	edit: "Edit Customer",
	editHeading: "Edit Customer",
	email: "Email address",
	name: "Name",
	save: "Save Changes",
} as const;
