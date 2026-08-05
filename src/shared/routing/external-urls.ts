/**
 * External URLs referenced across the app (landing page, demo banner).
 * Internal navigation targets live in `routes.ts`.
 */

/** Public GitHub repository for this portfolio project. */
export const GITHUB_REPO_URL =
	"https://github.com/andrewpetersondev/nextjs-dashboard" as const;

/**
 * The live deployment's own origin.
 *
 * Consumed by `metadataBase` (which resolves every relative OG/twitter asset
 * URL against it) and by the production smoke guard. It lives here rather than
 * inline in the layout so those two can never disagree about which deployment
 * is "production".
 */
export const PRODUCTION_SITE_URL =
	"https://nextjs-dashboard-beige-pi-12.vercel.app" as const;
