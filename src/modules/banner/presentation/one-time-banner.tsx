"use client";

import { type JSX, useCallback, useState, useTransition } from "react";
import { dismissBannerAction } from "@/modules/banner/presentation/actions/dismiss-banner.action";
import { GITHUB_REPO_URL } from "@/shared/routing/external-urls";

/**
 * The dismissible "you're browsing seeded demo data" notice.
 *
 * Renders whenever mounted and never reads the cookie itself — the server parent
 * (`app/dashboard/layout.tsx`) gates it via `isBannerDismissed()`.
 *
 * @returns `null` once dismissed within the current page; the server gate is
 * what keeps it closed on later renders.
 */
export function OneTimeBanner(): JSX.Element | null {
	const [open, setOpen] = useState(true);
	const [pending, startTransition] = useTransition();

	/** Writes the cookie before hiding, so a failed write leaves the banner up. */
	const handleDismiss = useCallback((): void => {
		startTransition(async () => {
			await dismissBannerAction();
			setOpen(false);
		});
	}, []);

	if (!open) {
		return null;
	}

	return (
		<div className="mb-6 rounded-md bg-bg-secondary p-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="font-medium text-text-primary">Portfolio demo</p>
					<p className="text-sm text-text-secondary">
						You&apos;re browsing seeded demo data — explore freely. Curious how
						it&apos;s built?{" "}
						<a
							className="underline transition-colors hover:text-text-hover"
							href={GITHUB_REPO_URL}
						>
							Read the source on GitHub
						</a>
						.
					</p>
				</div>

				<button
					className="font-semibold text-sm text-text-secondary hover:text-text-primary"
					disabled={pending}
					onClick={handleDismiss}
					type="button"
				>
					{pending ? "Saving…" : "Dismiss"}
				</button>
			</div>
		</div>
	);
}
