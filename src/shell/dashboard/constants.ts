/**
 * Dashboard heading per role, keyed by lowercased `UserRole`.
 *
 * The heading is the only thing role changes about the overview page — the cards
 * and charts are identical for all three.
 */
export const DASHBOARD_TITLES = {
	admin: "Admin Dashboard",
	guest: "Guest Dashboard",
	user: "User Dashboard",
} as const;
