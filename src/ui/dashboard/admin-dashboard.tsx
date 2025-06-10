import { CardWrapper } from "@/src/ui/dashboard/cards";
import LatestInvoices from "@/src/ui/dashboard/latest-invoices";
import RevenueChart from "@/src/ui/dashboard/revenue-chart";
import {
	CardsSkeleton,
	LatestInvoicesSkeleton,
	RevenueChartSkeleton,
} from "@/src/ui/skeletons";
import { type JSX, Suspense } from "react";

export default function AdminDashboard(): JSX.Element {
	return (
		<main>
			<h1 className="mb-4 text-xl md:text-2xl">Admin Dashboard</h1>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Suspense fallback={<CardsSkeleton />}>
					<CardWrapper />
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
