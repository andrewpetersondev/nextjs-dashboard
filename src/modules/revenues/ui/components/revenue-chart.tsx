import { CalendarIcon } from "@heroicons/react/16/solid";
import type { JSX } from "react";
import { generateYaxis } from "@/modules/revenues/domain/display/y-axis";
import type { SimpleRevenueDto } from "@/modules/revenues/domain/types";
import { getRevenueChartAction } from "@/modules/revenues/server/application/actions/revenue.actions";
import { H2, H3 } from "@/ui/atoms/typography/headings";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <not to long>
export async function RevenueChart(): Promise<JSX.Element> {
  const result = await getRevenueChartAction();

  if (!result.success) {
    return (
      <div className="w-full md:col-span-4" data-cy="revenue-chart-section">
        <H2 className="mb-4">Recent Revenue</H2>
        <p
          className="mt-4 text-text-error"
          data-cy="revenue-chart-error-message"
        >
          {result.error}
        </p>
      </div>
    );
  }

  const revenue: SimpleRevenueDto[] = [...result.data.monthlyData];
  const chartHeight = 350;

  const { yAxisLabels, topLabel } = generateYaxis(revenue);
  // Avoid division by zero when all data points are zero
  const scaleTop = topLabel > 0 ? topLabel : 1;

  if (!revenue || revenue.length === 0) {
    return (
      <div className="w-full md:col-span-4" data-cy="revenue-chart-section">
        <H2 className="mb-4">Recent Revenue</H2>
        <p
          className="mt-4 text-text-error"
          data-cy="revenue-chart-no-data-message"
        >
          No data available.
        </p>
      </div>
    );
  }
  return (
    <div className="w-full md:col-span-4" data-cy="revenue-chart-section">
      <H2 className="mb-4">Recent Revenue</H2>
      <div className="rounded-xl bg-bg-secondary p-4" data-cy="revenue-chart">
        {/* Horizontal scrollable container for the chart */}
        <div className="overflow-x-auto">
          <div className="flex min-w-fit items-end gap-2 rounded-md bg-bg-primary p-4 md:gap-4">
            {/* Y-axis labels - fixed position */}
            <div
              className="flex flex-shrink-0 flex-col justify-between text-sm text-text-primary"
              data-cy="revenue-chart-y-axis"
              style={{ height: `${chartHeight}px` }}
            >
              {yAxisLabels.map(
                (label: string): JSX.Element => (
                  <p
                    className="mb-6 last:mb-0"
                    data-cy="revenue-chart-y-axis-label"
                    key={label}
                  >
                    {label}
                  </p>
                ),
              )}
            </div>
            {/* Revenue bars - scrollable content */}
            {revenue.map(
              (month: SimpleRevenueDto): JSX.Element => (
                <div
                  className="flex min-w-[40px] flex-shrink-0 flex-col items-center gap-2 sm:min-w-[60px]"
                  data-cy="revenue-chart-bar"
                  key={month.month}
                >
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-md"
                    data-cy="revenue-chart-bar-stack"
                    style={{
                      height: `${(chartHeight / scaleTop) * month.totalAmount}px`,
                    }}
                  >
                    <div
                      className="w-full bg-bg-error"
                      data-cy="revenue-chart-bar-pending"
                      style={{
                        height: `${(chartHeight / scaleTop) * month.totalPendingAmount}px`,
                      }}
                    />
                    <div
                      className="w-full bg-bg-accent"
                      data-cy="revenue-chart-bar-paid"
                      style={{
                        height: `${(chartHeight / scaleTop) * month.totalPaidAmount}px`,
                      }}
                    />
                  </div>
                  <p
                    className="whitespace-nowrap text-sm text-text-primary"
                    data-cy="revenue-chart-month-label"
                  >
                    {month.month}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
        <div
          className="flex items-center pt-6 pb-2 text-text-primary"
          data-cy="revenue-chart-legend"
        >
          <CalendarIcon className="h-5 w-5" />
          <H3 className="ml-2">Last 12 months</H3>
        </div>
      </div>
    </div>
  );
}
