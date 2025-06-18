import { getDB } from "@/src/db/connection";
import { fetchRevenue } from "@/src/lib/dal/revenue.dal";
import type { Revenue } from "@/src/lib/definitions/revenue";
import { generateYAxis } from "@/src/lib/utils/utils";
import { H2, H3 } from "@/src/ui/headings";
import { CalendarIcon } from "@heroicons/react/16/solid";
import type { JSX } from "react";

export default async function RevenueChart(): Promise<JSX.Element> {
	const db = getDB();
	const revenue: Revenue[] = await fetchRevenue(db);
	const chartHeight = 350;

	const { yAxisLabels, topLabel } = generateYAxis(revenue);

	if (!revenue || revenue.length === 0) {
		return <p className="text-text-error mt-4">No data available.</p>;
	}

	return (
		<div className="w-full md:col-span-4">
			<H2 className="mb-4">Recent Revenue</H2>

			<div className="bg-bg-secondary rounded-xl p-4">
				<div className="bg-bg-primary mt-0 grid grid-cols-12 items-end gap-2 rounded-md p-4 sm:grid-cols-13 md:gap-4">
					<div
						className="text-text-primary mb-6 hidden flex-col justify-between text-sm sm:flex"
						style={{ height: `${chartHeight}px` }}
					>
						{yAxisLabels.map(
							(label: string): JSX.Element => (
								<p key={label}>{label}</p>
							),
						)}
					</div>

					{revenue.map(
						(month: Revenue): JSX.Element => (
							<div
								key={month.month}
								className="flex flex-col items-center gap-2"
							>
								<div
									className="bg-bg-accent w-full rounded-md"
									style={{
										height: `${(chartHeight / topLabel) * month.revenue}px`,
									}}
								/>
								<p className="text-text-primary -rotate-90 text-sm sm:rotate-0">
									{month.month}
								</p>
							</div>
						),
					)}
				</div>
				<div className="text-text-primary flex items-center pt-6 pb-2">
					<CalendarIcon className="h-5 w-5" />
					<H3 className="ml-2">Last 12 months</H3>
				</div>
			</div>
		</div>
	);
}
