import type { JSX } from "react";
import { LatestInvoicesSkeleton } from "@/modules/invoices/presentation/components/invoices.skeletons";
import { CardSkeleton } from "@/ui/skeletons/skeletons";
import { shimmer } from "@/ui/skeletons/skeletons.constants";

/**
 * Loading placeholder for the whole dashboard overview.
 *
 * Mirrors the real layout — heading, four cards, latest-invoices list — so the
 * page does not jump when content arrives. Keep it in step with
 * `DashboardOverview`; a skeleton of the wrong shape is worse than none.
 */
export function DashboardSkeleton(): JSX.Element {
	return (
		<div>
			<div
				className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-bg-accent`}
			/>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<CardSkeleton />
				<CardSkeleton />
				<CardSkeleton />
				<CardSkeleton />
			</div>
			<div className="mt-6">
				<LatestInvoicesSkeleton />
			</div>
		</div>
	);
}
