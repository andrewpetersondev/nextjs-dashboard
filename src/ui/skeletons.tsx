import type { JSX } from "react";

const shimmer =
	"before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function CardSkeleton(): JSX.Element {
	return (
		<div
			className={`${shimmer} bg-bg-accent relative overflow-hidden rounded-xl p-2 shadow-xs`}
		>
			<div className="flex p-4">
				<div className="bg-bg-primary h-5 w-5 rounded-md" />
				<div className="bg-bg-primary ml-2 h-6 w-16 rounded-md text-sm font-medium" />
			</div>
			<div className="bg-bg-primary flex items-center justify-center truncate rounded-xl px-4 py-8">
				<div className="bg-bg-accent h-7 w-20 rounded-md" />
			</div>
		</div>
	);
}

export function CardsSkeleton(): JSX.Element {
	return (
		<>
			<CardSkeleton />
			<CardSkeleton />
			<CardSkeleton />
			<CardSkeleton />
		</>
	);
}

export function RevenueChartSkeleton(): JSX.Element {
	return (
		<div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
			<div className="bg-bg-accent mb-4 h-8 w-36 rounded-md" />
			<div className="bg-bg-accent rounded-xl p-4">
				<div className="bg-bg-primary mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md p-4 sm:grid-cols-13 md:gap-4" />
				<div className="flex items-center pt-6 pb-2">
					<div className="bg-bg-primary h-5 w-5 rounded-full" />
					<div className="bg-bg-primary ml-2 h-4 w-20 rounded-md" />
				</div>
			</div>
		</div>
	);
}

export function InvoiceSkeleton(): JSX.Element {
	return (
		<div className="border-bg-accent flex flex-row items-center justify-between border-b py-4">
			<div className="flex items-center">
				<div className="bg-bg-accent mr-2 h-8 w-8 rounded-full" />
				<div className="min-w-0">
					<div className="bg-bg-accent h-5 w-40 rounded-md" />
					<div className="bg-bg-accent mt-2 h-4 w-12 rounded-md" />
				</div>
			</div>
			<div className="bg-bg-accent mt-2 h-4 w-12 rounded-md" />
		</div>
	);
}

export function LatestInvoicesSkeleton(): JSX.Element {
	return (
		<div
			className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
		>
			<div className="bg-bg-accent mb-4 h-8 w-36 rounded-md" />
			<div className="bg-bg-accent flex grow flex-col justify-between rounded-xl p-4">
				<div className="bg-bg-primary px-6">
					<InvoiceSkeleton />
					<InvoiceSkeleton />
					<InvoiceSkeleton />
					<InvoiceSkeleton />
					<InvoiceSkeleton />
				</div>
				<div className="flex items-center pt-6 pb-2">
					<div className="bg-bg-accent h-5 w-5 rounded-full" />
					<div className="bg-bg-accent ml-2 h-4 w-20 rounded-md" />
				</div>
			</div>
		</div>
	);
}

export function DashboardSkeleton(): JSX.Element {
	return (
		<div>
			<div
				className={`${shimmer} bg-bg-accent relative mb-4 h-8 w-36 overflow-hidden rounded-md`}
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

export function TableRowSkeleton(): JSX.Element {
	return (
		<tr className="w-full border-b border-bg-primary last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
			{/* Customer Name and Image */}
			<td className="relative overflow-hidden py-3 pr-3 pl-6 whitespace-nowrap">
				<div className="flex items-center gap-3">
					<div className="bg-bg-accent h-8 w-8 rounded-full" />
					<div className="bg-bg-accent h-6 w-24 rounded-sm" />
				</div>
			</td>
			{/* Email */}
			<td className="px-3 py-3 whitespace-nowrap">
				<div className="bg-bg-accent h-6 w-32 rounded-sm" />
			</td>
			{/* Amount */}
			<td className="px-3 py-3 whitespace-nowrap">
				<div className="bg-bg-accent h-6 w-16 rounded-sm" />
			</td>
			{/* Date */}
			<td className="px-3 py-3 whitespace-nowrap">
				<div className="bg-bg-accent h-6 w-16 rounded-sm" />
			</td>
			{/* InvoiceStatusComponent */}
			<td className="px-3 py-3 whitespace-nowrap">
				<div className="bg-bg-accent h-6 w-16 rounded-sm" />
			</td>
			{/* Actions */}
			<td className="py-3 pr-3 pl-6 whitespace-nowrap">
				<div className="flex justify-end gap-3">
					<div className="bg-bg-accent h-[38px] w-[38px] rounded-sm" />
					<div className="bg-bg-accent h-[38px] w-[38px] rounded-sm" />
				</div>
			</td>
		</tr>
	);
}

export function InvoicesMobileSkeleton(): JSX.Element {
	return (
		<div className="bg-bg-accent mb-2 w-full rounded-md p-4">
			<div className="border-bg-primary flex items-center justify-between border-b pb-8">
				<div className="flex items-center">
					<div className="bg-bg-accent mr-2 h-8 w-8 rounded-full" />
					<div className="bg-bg-accent h-6 w-16 rounded-sm" />
				</div>
				<div className="bg-bg-accent h-6 w-16 rounded-sm" />
			</div>
			<div className="flex w-full items-center justify-between pt-4">
				<div>
					<div className="bg-bg-accent h-6 w-16 rounded-sm" />
					<div className="mt-2 h-6 w-24 rounded-sm bg-bg-primary" />
				</div>
				<div className="flex justify-end gap-2">
					<div className="bg-bg-accent h-10 w-10 rounded-sm" />
					<div className="bg-bg-accent h-10 w-10 rounded-sm" />
				</div>
			</div>
		</div>
	);
}

export function InvoicesTableSkeleton(): JSX.Element {
	return (
		<div className="mt-6 flow-root">
			<div className="inline-block min-w-full align-middle">
				<div className="bg-bg-accent rounded-lg p-2 md:pt-0">
					<div className="md:hidden">
						<InvoicesMobileSkeleton />
						<InvoicesMobileSkeleton />
						<InvoicesMobileSkeleton />
						<InvoicesMobileSkeleton />
						<InvoicesMobileSkeleton />
						<InvoicesMobileSkeleton />
					</div>
					<table className="text-text-primary hidden min-w-full md:table">
						<thead className="rounded-lg text-left text-sm font-normal">
							<tr>
								<th className="px-4 py-5 font-medium sm:pl-6" scope="col">
									Customer
								</th>
								<th className="px-3 py-5 font-medium" scope="col">
									Email
								</th>
								<th className="px-3 py-5 font-medium" scope="col">
									Amount
								</th>
								<th className="px-3 py-5 font-medium" scope="col">
									Date
								</th>
								<th className="px-3 py-5 font-medium" scope="col">
									Status
								</th>
								<th className="relative pt-2 pr-6 pb-4 pl-3 sm:pr-6" scope="col">
									<span className="sr-only">Edit</span>
								</th>
							</tr>
						</thead>
						<tbody className="bg-bg-accent">
							<TableRowSkeleton />
							<TableRowSkeleton />
							<TableRowSkeleton />
							<TableRowSkeleton />
							<TableRowSkeleton />
							<TableRowSkeleton />
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export function InvoicesSearchSkeleton(): JSX.Element {
	return <div>Invoices Search Skeleton</div>;
}
