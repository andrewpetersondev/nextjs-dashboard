import { CardWrapper } from "@/ui/dashboard/cards";
import RevenueChart from "@/ui/dashboard/revenue-chart";
import LatestInvoices from "@/ui/dashboard/latest-invoices";
import { Suspense } from "react";
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from "@/ui/skeletons";

export default function UserDashboard() {
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">User Dashboard</h1>
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
