// Common, reusable selectors across features
export const COMMON_SEL = {
  addItemButton: '[data-cy="add-item-button"]',
  confirmDeleteButton: '[data-cy="confirm-delete-button"]',
  dateInput: '[data-cy="date-input"]',
  deleteItemButton: '[data-cy="delete-item-button"]',
  editItemButton: '[data-cy="edit-item-button"]',
  itemDescriptionInput: '[data-cy="item-description-input"]',
  itemNameInput: '[data-cy="item-name-input"]',
  saveItemButton: '[data-cy="save-item-button"]',
  sensitiveDataInput: '[data-cy="sensitive-data-input"]',
} as const satisfies Readonly<Record<string, string>>;

// Auth-related selectors (login/signup)
export const AUTH_SEL = {
  loginEmail: '[data-cy="login-email-input"]',
  loginPassword: '[data-cy="login-password-input"]',
  loginSubmit: '[data-cy="login-submit-button"]',
  nextjsCourseLink: '[data-testid="nextjs-course-link"]',
  signupEmail: '[data-cy="signup-email-input"]',
  signupPassword: '[data-cy="signup-password-input"]',
  signupSubmit: '[data-cy="signup-submit-button"]',
  signupUsername: '[data-cy="signup-username-input"]',
  toLoginButton: '[data-testid="login-button"]',
} as const satisfies Readonly<Record<string, string>>;

// Invoice feature selectors
export const INVOICES_SEL = {
  createInvoiceErrorMessage: '[data-cy="create-invoice-error-message"]',
  createInvoiceSubmitButton: '[data-cy="create-invoice-submit-button"]',
  createInvoiceSuccessMessage: '[data-cy="create-invoice-success-message"]',
  editInvoiceSubmitButton: '[data-cy="edit-invoice-submit-button"]',
  invoiceAmountInput: '[data-cy="amount-input"]',
  invoiceCreateButton: '[data-cy="create-invoice-submit-button"]',
  invoiceCustomerSelect: '[data-cy="customer-select"]',
  invoiceRow: '[data-cy="invoice-row"]',
  invoiceSensitiveDataInput: '[data-cy="sensitive-data-input"]',
  invoiceStatusPaid: "#paid",
  invoiceStatusPending: "#pending",
  invoiceStatusRadioGroup: '[data-cy="invoice-status-radio-group"]',
  invoicesTable: '[data-cy="invoices-table"]',
} as const satisfies Readonly<Record<string, string>>;

// Customers feature selectors
export const CUSTOMERS_SEL = {
  customerMobileCard: '[data-cy="customer-mobile-card"]',
  customerRow: '[data-cy="customer-row"]',
  customerSelect: '[data-cy="customer-select"]',
  customersMobileTable: '[data-cy="customers-table-mobile"]',
  customersTable: '[data-cy="customers-table"]',
} as const satisfies Readonly<Record<string, string>>;
