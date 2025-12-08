// Centralized route constants and helpers.
// Keep this file small, dependency-free, and broadly reusable.

// Types
type StaticPath = `/${string}`;
type DynamicBuilder = (...args: string[]) => StaticPath;

// Reusable regex/constants
const TRAILING_SLASH_REGEX = /\/+$/;

type RoutesShape = Readonly<{
  auth: Readonly<{
    login: StaticPath;
    signup: StaticPath;
  }>;
  dashboard: Readonly<{
    createInvoice: DynamicBuilder;
    createUser: DynamicBuilder;
    customers: StaticPath;
    invoice: (id: string) => StaticPath;
    invoiceEdit: (id: string) => StaticPath;
    invoices: StaticPath;
    root: StaticPath;
    userEdit: (id: string) => StaticPath;
    users: StaticPath;
  }>;
  root: StaticPath;
}>;

// Core route map (preserved keys/shape for compatibility)
export const ROUTES: RoutesShape = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
  },
  dashboard: {
    createInvoice: () => "/dashboard/invoices/create",
    createUser: () => "/dashboard/users/create",
    customers: "/dashboard/customers",
    invoice: (id: string) => `/dashboard/invoices/${encodeURIComponent(id)}`,
    invoiceEdit: (id: string) =>
      `/dashboard/invoices/${encodeURIComponent(id)}/edit`,
    invoices: "/dashboard/invoices",
    root: "/dashboard",
    userEdit: (id: string) => `/dashboard/users/${encodeURIComponent(id)}/edit`,
    users: "/dashboard/users",
  },
  root: "/",
} as const;

// Middleware/shared guards
export const PROTECTED_PREFIX = ROUTES.dashboard.root;
export const ADMIN_PREFIX = ROUTES.dashboard.users;
export const PUBLIC_ROUTES = new Set<string>([
  ROUTES.auth.login,
  ROUTES.auth.signup,
  ROUTES.root,
]);

// Helpers

/**
 * Normalizes a path to ensure it starts with a single slash and has no trailing slash (except root).
 */
export function normalizePath(path: string): StaticPath {
  const trimmed = path.trim();
  if (!trimmed) {
    return "/" as const;
  }
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withLeading === "/") {
    return "/" as const;
  }
  return (withLeading.replace(TRAILING_SLASH_REGEX, "") || "/") as StaticPath;
}

/**
 * Returns true if the path is considered public (no auth required).
 */
export function isPublicRoute(path: string): boolean {
  const p = normalizePath(path);
  return PUBLIC_ROUTES.has(p);
}

/**
 * Returns true if the path is in the protected area (dashboard).
 */
export function isProtectedRoute(path: string): boolean {
  const p = normalizePath(path);
  return p === PROTECTED_PREFIX || p.startsWith(`${PROTECTED_PREFIX}/`);
}

/**
 * Returns true if the path is in the admin area (user management).
 */
export function isAdminRoute(path: string): boolean {
  const p = normalizePath(path);
  return p === ADMIN_PREFIX || p.startsWith(`${ADMIN_PREFIX}/`);
}
