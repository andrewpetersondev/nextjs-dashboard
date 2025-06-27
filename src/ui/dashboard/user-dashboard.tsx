"use server";

import { type JSX, Suspense } from "react";
import { type CardData, fetchCardData } from "@/src/lib/dal/data.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import { CardWrapper } from "@/src/ui/dashboard/cards.tsx";
import { LatestInvoices } from "@/src/ui/dashboard/latest-invoices.tsx";
import { RevenueChart } from "@/src/ui/dashboard/revenue-chart.tsx";
import { H1 } from "@/src/ui/headings.tsx";
import {
	CardsSkeleton,
	LatestInvoicesSkeleton,
	RevenueChartSkeleton,
} from "@/src/ui/skeletons.tsx";

export async function UserDashboard(): Promise<JSX.Element> {
	const db = getDB();
	const cardData: CardData = await fetchCardData(db);

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
