import { type JSX, Suspense } from "react";
import { CardWrapper } from "@/features/dashboard/components/cards";
import type { DashboardCardData } from "@/features/dashboard/types";
import { LatestInvoices } from "@/features/invoices/components/latest-invoices";
import { RevenueChart } from "@/features/revenues/components/revenue-chart";
import type { InvoiceListFilter } from "@/shared/invoices/dto/types";
import { H1 } from "@/ui/primitives/headings";
import {
  CardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from "@/ui/skeletons";

interface DashboardProps {
  readonly dashboardCardData: DashboardCardData;
  readonly latestInvoices: InvoiceListFilter[];
  readonly title: string;
}

/**
 * Consolidated Dashboard component for both admin and user dashboards.
 * Fetches card data and renders dashboard widgets with Suspense for streaming.
 * @param props - DashboardProps
 * @returns The dashboard JSX element.
 */
export const Dashboard = ({
  dashboardCardData,
  latestInvoices,
  title,
}: DashboardProps): JSX.Element => {
  return (
    <section>
      <H1 className="mb-4">{title}</H1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Suspense enables streaming for async server components */}
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper data={dashboardCardData} />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices latestInvoices={latestInvoices} />
        </Suspense>
      </div>
    </section>
  );
};
