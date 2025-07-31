import { CalendarIcon } from "@heroicons/react/16/solid";
import type { JSX } from "react";
import { getRevenueChartAction } from "@/features/revenues/revenue.actions";
import type { SimpleRevenueDto } from "@/features/revenues/revenue.dto";
import { generateYAxis } from "@/features/revenues/revenue.utils";
import { H2, H3 } from "@/ui/headings";

export async function RevenueChart(): Promise<JSX.Element> {
  const result = await getRevenueChartAction();

  if (!result.success) {
    return (
      <div className="w-full md:col-span-4">
        <H2 className="mb-4">Recent Revenue</H2>
        <p className="mt-4 text-text-error">{result.error}</p>
      </div>
    );
  }

  const revenue: SimpleRevenueDto[] = result.data;
  const chartHeight = 350;

  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  if (!revenue || revenue.length === 0) {
    return (
      <div className="w-full md:col-span-4">
        <H2 className="mb-4">Recent Revenue</H2>
        <p className="mt-4 text-text-error">No data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full md:col-span-4">
      <H2 className="mb-4">Recent Revenue</H2>

      <div className="rounded-xl bg-bg-secondary p-4">
        {/* Grid layout with 12 columns on mobile, 13 on small screens and up to accommodate y-axis labels and revenue bars */}
        <div className="mt-0 grid grid-cols-[auto_repeat(11,_1fr)] items-end gap-2 rounded-md bg-bg-primary p-4 sm:grid-cols-[auto_repeat(12,_1fr)] md:gap-4">
          <div
            className="mb-6 flex flex-col justify-between text-sm text-text-primary sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map(
              (label: string): JSX.Element => (
                <p key={label}>{label}</p>
              ),
            )}
          </div>

          {revenue.map(
            (month: SimpleRevenueDto): JSX.Element => (
              <div
                className="flex flex-col items-center gap-2"
                key={month.month}
              >
                <div
                  className="w-full rounded-md bg-bg-accent"
                  style={{
                    height: `${(chartHeight / topLabel) * month.revenue}px`,
                  }}
                />
                <p className="-rotate-90 text-sm text-text-primary sm:rotate-0">
                  {month.month}
                </p>
              </div>
            ),
          )}
        </div>
        <div className="flex items-center pt-6 pb-2 text-text-primary">
          <CalendarIcon className="h-5 w-5" />
          <H3 className="ml-2">Last 12 months</H3>
        </div>
      </div>
    </div>
  );
}
