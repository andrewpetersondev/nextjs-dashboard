import type { JSX } from "react";
import { LatestInvoicesSkeleton } from "@/modules/invoices/ui/components/invoices.skeletons";
import { RevenueChartSkeleton } from "@/modules/revenues/ui/components/revenue-chart.skeleton";
import { CardSkeleton } from "@/ui/feedback/skeleton/skeletons";
import { shimmer } from "@/ui/feedback/skeleton/skeletons.constants";

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
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </div>
  );
}
