// Centralized route constants and helpers.
// Keep this file small, dependency-free, and broadly reusable.

// Types
type StaticPath = `/${string}`;
type DynamicBuilder = (...args: string[]) => StaticPath;

// Reusable regex/constants
const TRAILING_SLASH_REGEX = /\/+$/;

type RoutesShape = Readonly<{
  AUTH: Readonly<{
    LOGIN: StaticPath;
    SIGNUP: StaticPath;
  }>;
  DASHBOARD: Readonly<{
    ROOT: StaticPath;
    CUSTOMERS: StaticPath;
    INVOICES: StaticPath;
    USERS: StaticPath;
    createInvoice: DynamicBuilder;
    invoice: (id: string) => StaticPath;
    invoiceEdit: (id: string) => StaticPath;
    createUser: DynamicBuilder;
    userEdit: (id: string) => StaticPath;
  }>;
  ROOT: StaticPath;
}>;

// Core route map (preserved keys/shape for compatibility)
export const ROUTES: RoutesShape = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
  },
  DASHBOARD: {
    CUSTOMERS: "/dashboard/customers",
    createInvoice: () => "/dashboard/invoices/create",
    createUser: () => "/dashboard/users/create",
    INVOICES: "/dashboard/invoices",
    invoice: (id: string) => `/dashboard/invoices/${encodeURIComponent(id)}`,
    invoiceEdit: (id: string) =>
      `/dashboard/invoices/${encodeURIComponent(id)}/edit`,
    ROOT: "/dashboard",
    USERS: "/dashboard/users",
    userEdit: (id: string) => `/dashboard/users/${encodeURIComponent(id)}/edit`,
  },
  ROOT: "/",
} as const;

// Middleware/shared guards
export const PROTECTED_PREFIX = ROUTES.DASHBOARD.ROOT;
export const ADMIN_PREFIX = ROUTES.DASHBOARD.USERS;
export const PUBLIC_ROUTES = new Set<string>([
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.ROOT,
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
 * Appends query parameters to a base path.
 */
export function withQuery(
  base: string,
  query?: Record<string, string | number | boolean | undefined | null>,
): StaticPath {
  const normBase = normalizePath(base);
  if (!query) {
    return normBase;
  }
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) {
      continue;
    }
    params.append(k, String(v));
  }
  const qs = params.toString();
  return (qs ? `${normBase}?${qs}` : normBase) as StaticPath;
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
