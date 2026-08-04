import { FaceFrownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { ROUTES } from "@/shared/routing/routes";
import { H1 } from "@/ui/atoms/headings.atom";

/**
 * Root 404.
 *
 * @remarks
 * Not optional under this app's CSP. Next's built-in NotFound ships a bare
 * inline `<style>` element plus four inline `style=""` attributes, and
 * `style-src 'self'` carries no nonce — style attributes cannot take one at all
 * — so the fallback renders unstyled. `devtools/cli/csp-guard.cli.ts` asserts
 * that no served document contains inline styles, which keeps this file honest.
 */
export default function NotFound(): JSX.Element {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg-primary p-6 text-center">
			<FaceFrownIcon aria-hidden="true" className="w-12 text-text-disabled" />
			<H1 className="font-semibold text-2xl">404 — Page not found</H1>
			<p className="max-w-prose text-text-secondary">
				That page does not exist. It may have moved, or the link may be wrong.
			</p>
			<Link
				className="mt-4 rounded-md bg-bg-accent px-4 py-2 text-sm text-text-accent transition-colors hover:bg-bg-hover hover:text-text-hover"
				href={ROUTES.root}
			>
				Back to home
			</Link>
		</main>
	);
}
