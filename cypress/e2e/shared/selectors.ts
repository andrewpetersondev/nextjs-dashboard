// Common, reusable selectors across features
export const COMMON_SEL = {
	addItemButton: '[data-cy="add-item-button"]',
	dateInput: '[data-cy="date-input"]',
	deleteItemButton: '[data-cy="delete-item-button"]',
	editItemButton: '[data-cy="edit-item-button"]',
	sensitiveDataInput: '[data-cy="sensitive-data-input"]',
	// Server-action feedback rendered by ServerMessageMolecule (shared by
	// the create and edit forms). The molecule emits these data-cy values.
	serverMessageError: '[data-cy="server-message-error"]',
	serverMessageSuccess: '[data-cy="server-message-success"]',
} as const satisfies Readonly<Record<string, string>>;

// Auth-related selectors (login/signup)
export const AUTH_SEL = {
	// Server-action feedback rendered by AuthFormFeedback (FormAlertMolecule).
	authServerMessageError: '[data-cy="auth-server-message-error"]',
	authServerMessageSuccess: '[data-cy="auth-server-message-success"]',
	forgotPasswordDemoNote: '[data-cy="forgot-password-demo-note"]',
	forgotPasswordEmail: '[data-cy="forgot-password-email-input"]',
	forgotPasswordForm: '[data-cy="forgot-password-form"]',
	forgotPasswordSubmit: '[data-cy="forgot-password-submit-button"]',
	githubRepoLink: '[data-testid="github-repo-link"]',
	landingDemoButton: '[data-cy="demo-user-button-try-demo"]',
	loginEmail: '[data-cy="login-email-input"]',
	//  For a "pure" fundamental level, lean more heavily on Testing Library queries (which you already have installed).
	//  Instead of cy.get('#email'), use cy.findByLabelText(/email/i). This makes tests less dependent on code structure
	//  and more on user experience.
	loginPassword: '[data-cy="login-password-input"]',
	loginSubmit: '[data-cy="login-submit-button"]',
	signupEmail: '[data-cy="signup-email-input"]',
	signupPassword: '[data-cy="signup-password-input"]',
	signupSubmit: '[data-cy="signup-submit-button"]',
	signupUsername: '[data-cy="signup-username-input"]',
	toLoginButton: '[data-testid="login-button"]',
} as const satisfies Readonly<Record<string, string>>;

// Invoice feature selectors.
// Note: success/error feedback uses COMMON_SEL.serverMessage* (shared molecule).
export const INVOICES_SEL = {
	createInvoiceSubmitButton: '[data-cy="create-invoice-submit-button"]',
	editInvoiceSubmitButton: '[data-cy="edit-invoice-submit-button"]',
	invoiceAmountInput: '[data-cy="amount-input"]',
	invoiceCustomerSelect: '[data-cy="customer-select"]',
	invoiceRow: '[data-cy="invoice-row"]',
	invoiceStatusBadge: '[data-cy="invoice-status-badge"]',
	invoiceStatusFilterOverdue: '[data-cy="invoice-status-filter-overdue"]',
	invoiceStatusFilterPaid: '[data-cy="invoice-status-filter-paid"]',
	invoiceStatusPaid: "#paid",
	invoiceStatusPending: "#pending",
	invoiceStatusRadioGroup: '[data-cy="invoice-status-radio-group"]',
	invoiceStatusTransitionGroup: '[data-cy="invoice-status-transition-group"]',
	invoicesTable: '[data-cy="invoices-table"]',
	invoiceTransitionPaid: '[data-cy="invoice-transition-paid"]',
	invoiceTransitionVoid: '[data-cy="invoice-transition-void"]',
} as const satisfies Readonly<Record<string, string>>;

// Customers feature selectors
export const CUSTOMERS_SEL = {
	customerMobileCard: '[data-cy="customer-mobile-card"]',
	customerRow: '[data-cy="customer-row"]',
	customerSelect: '[data-cy="customer-select"]',
	customersMobileTable: '[data-cy="customers-table-mobile"]',
	customersTable: '[data-cy="customers-table"]',
} as const satisfies Readonly<Record<string, string>>;
