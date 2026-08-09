/**
 * Naming scheme for generated demo accounts.
 *
 * Demo sign-ups create real, permanent users, so these make them identifiable
 * afterwards: the `demo.com` domain is what distinguishes a seeded visitor from
 * a genuine account when clearing them out.
 */
export const DEMO_IDENTITY_CONFIG = {
	EMAIL_DOMAIN: "demo.com",
	USERNAME_PREFIX: "Demo",
} as const;
