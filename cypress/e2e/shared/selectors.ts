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

export type CommonSelKey = keyof typeof COMMON_SEL;

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

export type AuthSelKey = keyof typeof AUTH_SEL;

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

export type InvoicesSelKey = keyof typeof INVOICES_SEL;

// Customers feature selectors
export const CUSTOMERS_SEL = {
  customerMobileCard: '[data-cy="customer-mobile-card"]',
  customerRow: '[data-cy="customer-row"]',
  customerSelect: '[data-cy="customer-select"]',
  customersMobileTable: '[data-cy="customers-table-mobile"]',
  customersTable: '[data-cy="customers-table"]',
} as const satisfies Readonly<Record<string, string>>;

export type CustomersSelKey = keyof typeof CUSTOMERS_SEL;

// Users feature selectors
export const USERS_SEL = {
  confirmSuspendButton: '[data-cy="confirm-suspend-button"]',
  createUserErrorMessage: '[data-cy="create-user-error-message"]',
  createUserSuccessMessage: '[data-cy="create-user-success-message"]',
  suspendUserButton: '[data-cy="suspend-user-button"]',
  userEmailInput: '[data-cy="user-email-input"]',
  userPasswordInput: '[data-cy="user-password-input"]',
  userRoleSelect: '[data-cy="user-role-select"]',
  userRow: '[data-cy="user-row"]',
  usersTable: '[data-cy="users-table"]',
  userUsernameInput: '[data-cy="user-username-input"]',
} as const satisfies Readonly<Record<string, string>>;

export type UsersSelKey = keyof typeof USERS_SEL;

// Revenues/ Dashboard-related selectors
export const REVENUES_SEL = {
  latestInvoices: '[data-cy="latest-invoices"]',
  latestInvoicesItem: '[data-cy="latest-invoices-item"]',
  revenueChart: '[data-cy="revenue-chart"]',
  revenueChartBar: '[data-cy="revenue-chart-bar"]',
  revenueChartBarPaid: '[data-cy="revenue-chart-bar-paid"]',
  revenueChartBarPending: '[data-cy="revenue-chart-bar-pending"]',
  revenueChartBarStack: '[data-cy="revenue-chart-bar-stack"]',
  revenueChartErrorMessage: '[data-cy="revenue-chart-error-message"]',
  revenueChartLegend: '[data-cy="revenue-chart-legend"]',
  revenueChartMonthLabel: '[data-cy="revenue-chart-month-label"]',
  revenueChartNoDataMessage: '[data-cy="revenue-chart-no-data-message"]',
  revenueChartSection: '[data-cy="revenue-chart-section"]',
  revenueChartYaxis: '[data-cy="revenue-chart-y-axis"]',
  revenueChartYaxisLabel: '[data-cy="revenue-chart-y-axis-label"]',
} as const satisfies Readonly<Record<string, string>>;

export type RevenuesSelKey = keyof typeof REVENUES_SEL;
