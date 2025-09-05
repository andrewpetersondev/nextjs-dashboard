/**
 * Application route paths used in E2E tests. Keep in sync with app router.
 */

// BASE
export const BASE_URL = "/" as const;

// BASE --> AUTH
export const SIGNUP_PATH = "/auth/signup" as const;
export const LOGIN_PATH = "/auth/login" as const;

// BASE --> DASHBOARD
export const DASHBOARD_PATH = "/dashboard" as const;

// DASHBOARD --> USERS
export const DASHBOARD_USERS_PATH = "/dashboard/users" as const;
export const ADMIN_USERS_PATH = "/admin/users" as const;

// DASHBOARD --> INVOICES
export const INVOICES_PATH = "/dashboard/invoices" as const;
export const CREATE_INVOICE_PATH = "/dashboard/invoices/create" as const;
