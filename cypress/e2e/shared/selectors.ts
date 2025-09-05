/**
 * Centralize data-cy and test id selectors to avoid duplication/typos across tests.
 * Prefer using these constants rather than inline strings in test code.
 */
export const SEL = {
  addItemButton: '[data-cy="add-item-button"]',
  confirmDeleteButton: '[data-cy="confirm-delete-button"]',
  confirmSuspendButton: '[data-cy="confirm-suspend-button"]',
  createInvoiceErrorMessage: '[data-cy="create-invoice-error-message"]',
  createInvoiceSubmitButton: '[data-cy="create-invoice-submit-button"]',
  createInvoiceSuccessMessage: '[data-cy="create-invoice-success-message"]',
  customerSelect: '[data-cy="customer-select"]',
  dateInput: '[data-cy="date-input"]',
  deleteItemButton: '[data-cy="delete-item-button"]',
  editItemButton: '[data-cy="edit-item-button"]',
  invoiceAmountInput: '[data-cy="amount-input"]',
  invoiceCreateButton: '[data-cy="create-invoice-submit-button"]',
  invoiceCustomerSelect: '[data-cy="customer-select"]',
  invoiceRow: '[data-cy="invoice-row"]',
  invoiceSensitiveDataInput: '[data-cy="sensitive-data-input"]',
  invoiceStatusPaid: "#paid",
  invoiceStatusPending: "#pending",
  invoiceStatusRadioGroup: '[data-cy="invoice-status-radio-group"]',
  invoicesTable: '[data-cy="invoices-table"]',
  itemDescriptionInput: '[data-cy="item-description-input"]',
  itemNameInput: '[data-cy="item-name-input"]',
  latestInvoices: '[data-cy="latest-invoices"]',
  latestInvoicesItem: '[data-cy="latest-invoices-item"]',
  loginEmail: '[data-cy="login-email-input"]',
  loginPassword: '[data-cy="login-password-input"]',
  loginSubmit: '[data-cy="login-submit-button"]',
  nextjsCourseLink: '[data-testid="nextjs-course-link"]',
  saveItemButton: '[data-cy="save-item-button"]',
  sensitiveDataInput: '[data-cy="sensitive-data-input"]',
  signupEmail: '[data-cy="signup-email-input"]',
  signupPassword: '[data-cy="signup-password-input"]',
  signupSubmit: '[data-cy="signup-submit-button"]',
  signupUsername: '[data-cy="signup-username-input"]',
  suspendUserButton: '[data-cy="suspend-user-button"]',
  toLoginButton: '[data-testid="login-button"]',
  userRow: '[data-cy="user-row"]',
} as const satisfies Readonly<Record<string, string>>;

/**
 * Union type of available selector keys.
 * @example type LoginSelectors = Pick<typeof SEL, 'loginEmail' | 'loginPassword'>
 */
export type SelKey = keyof typeof SEL;

export const INV_SEL = {
  createInvoiceSubmitButton: '[data-cy="create-invoice-submit-button"]',
  editInvoiceSubmitButton: '[data-cy="edit-invoice-submit-button"]',
} as const satisfies Readonly<Record<string, string>>;

export type InvSelKey = keyof typeof INV_SEL;
