import { CalendarIcon } from "@heroicons/react/16/solid";
import type { JSX } from "react";
import { getRevenueChartAction } from "@/features/revenues/actions/revenue.actions";
import type { SimpleRevenueDto } from "@/features/revenues/core/revenue.dto";
import { generateYAxis } from "@/features/revenues/utils/display/revenue-display.utils";
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

  const revenue: SimpleRevenueDto[] = [...result.data.monthlyData];
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
        {/* Horizontal scrollable container for the chart */}
        <div className="overflow-x-auto">
          <div className="flex min-w-fit items-end gap-2 rounded-md bg-bg-primary p-4 md:gap-4">
            {/* Y-axis labels - fixed position */}
            <div
              className="flex flex-shrink-0 flex-col justify-between text-sm text-text-primary"
              style={{ height: `${chartHeight}px` }}
            >
              {yAxisLabels.map(
                (label: string): JSX.Element => (
                  <p className="mb-6 last:mb-0" key={label}>
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
                  key={month.month}
                >
                  <div
                    className="w-full rounded-md bg-bg-accent"
                    style={{
                      height: `${(chartHeight / topLabel) * month.totalAmount}px`,
                    }}
                  />
                  <p className="whitespace-nowrap text-sm text-text-primary">
                    {month.month}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex items-center pt-6 pb-2 text-text-primary">
          <CalendarIcon className="h-5 w-5" />
          <H3 className="ml-2">Last 12 months</H3>
        </div>
      </div>
    </div>
  );
}
