import { type JSX, Suspense } from "react";
import type { DashboardCardData } from "@/features/data/types";
import type { InvoiceListFilter } from "@/features/invoices/types";
import { CardWrapper } from "@/ui/dashboard/cards";
import { LatestInvoices } from "@/ui/dashboard/latest-invoices";
import { RevenueChart } from "@/ui/dashboard/revenue-chart";
import { H1 } from "@/ui/headings";
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
export const Dashboard = async ({
  dashboardCardData,
  latestInvoices,
  title,
}: DashboardProps): Promise<JSX.Element> => {
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
