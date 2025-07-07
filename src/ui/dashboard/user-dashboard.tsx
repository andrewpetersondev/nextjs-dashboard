"use server";

import { type JSX, Suspense } from "react";
import { readCardDataAction } from "@/src/lib/actions/data.actions";
import { CardWrapper } from "@/src/ui/dashboard/cards";
import { LatestInvoices } from "@/src/ui/dashboard/latest-invoices";
import { RevenueChart } from "@/src/ui/dashboard/revenue-chart";
import { H1 } from "@/src/ui/headings";
import {
	CardsSkeleton,
	LatestInvoicesSkeleton,
	RevenueChartSkeleton,
} from "@/src/ui/skeletons";

export async function UserDashboard(): Promise<JSX.Element> {
	const cardData = await readCardDataAction();

	return (
		<main>
			<H1 className="mb-4">User Dashboard</H1>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Suspense fallback={<CardsSkeleton />}>
					<CardWrapper data={cardData} />
				</Suspense>
			</div>
			<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
				<Suspense fallback={<RevenueChartSkeleton />}>
					<RevenueChart />
				</Suspense>
				<Suspense fallback={<LatestInvoicesSkeleton />}>
					<LatestInvoices />
				</Suspense>
			</div>
		</main>
	);
}
