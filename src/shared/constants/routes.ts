// Centralized route constants and helpers
// Keep this file small and dependency-free so it can be reused broadly

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login" as const,
    SIGNUP: "/auth/signup" as const,
  },
  DASHBOARD: {
    CUSTOMERS: "/dashboard/customers" as const,
    createInvoice: () => "/dashboard/invoices/create" as const,
    createUser: () => "/dashboard/users/create" as const,
    INVOICES: "/dashboard/invoices" as const,
    invoice: (id: string) =>
      `/dashboard/invoices/${encodeURIComponent(id)}` as const,
    invoiceEdit: (id: string) =>
      `/dashboard/invoices/${encodeURIComponent(id)}/edit` as const,
    ROOT: "/dashboard" as const,
    USERS: "/dashboard/users" as const,
    userEdit: (id: string) =>
      `/dashboard/users/${encodeURIComponent(id)}/edit` as const,
  },
  ROOT: "/" as const,
} as const;

// Middleware/shared guards
export const PROTECTED_PREFIX = ROUTES.DASHBOARD.ROOT;
export const ADMIN_PREFIX = ROUTES.DASHBOARD.USERS;
export const PUBLIC_ROUTES = new Set<string>([
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.ROOT,
]);

// Optional: middleware matcher for readability/testability
export const EXCLUDED_PATHS_MATCHER =
  "/((?!api|_next/static|_next/image|_next/data|.*\\..*$).*)" as const;
