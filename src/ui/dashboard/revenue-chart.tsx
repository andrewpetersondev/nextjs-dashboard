import { lusitana } from "@/src/ui/fonts";
import { generateYAxis } from "@/src/lib/utils";
import { CalendarIcon } from "@heroicons/react/16/solid";
import { fetchRevenue } from "@/src/lib/data";

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function RevenueChart() {
  const revenue = await fetchRevenue();
  const chartHeight = 350;

  const { yAxisLabels, topLabel } = generateYAxis(revenue);
  if (!revenue || revenue.length === 0) {
    return <p className="mt-4 text-text-primary">No data available.</p>;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>

      <div className="rounded-xl bg-bg-accent p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-bg-primary p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {revenue.map((month) => (
            <div key={month.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-bg-secondary"
                style={{
                  height: `${(chartHeight / topLabel) * month.revenue}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-text-primary sm:rotate-0">
                {month.month}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-text-primary" />
          <h3 className="ml-2 text-sm text-text-primary">Last 12 months</h3>
        </div>
      </div>
    </div>
  );
}