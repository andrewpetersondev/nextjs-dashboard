import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import type { JSX } from "react";
import { fetchLatestInvoices } from "@/src/lib/dal/invoices.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import type { ModifiedLatestInvoicesData } from "@/src/lib/definitions/invoices.ts";
import { H2, H3 } from "@/src/ui/headings.tsx";

export async function LatestInvoices(): Promise<JSX.Element> {
	const db = getDB();

	const latestInvoices: ModifiedLatestInvoicesData[] =
		await fetchLatestInvoices(db);
	return (
		<div className="flex w-full flex-col md:col-span-4">
			<H2 className="mb-4">Latest Invoices</H2>
			<div className="bg-bg-secondary flex grow flex-col justify-between rounded-xl p-4">
				<div className="bg-bg-primary px-6">
					{latestInvoices.map(
						(invoice: ModifiedLatestInvoicesData, i: number): JSX.Element => {
							return (
								<div
									className={clsx(
										"flex flex-row items-center justify-between py-4",
										{
											"border-text-secondary border-t": i !== 0,
										},
									)}
									key={invoice.id}
								>
									<div className="flex items-center">
										<Image
											alt={`${invoice.name}'s profile picture`}
											className="mr-4 rounded-full"
											height={32}
											src={invoice.imageUrl}
											width={32}
										/>
										<div className="min-w-0">
											<p className="text-text-secondary truncate text-sm font-semibold md:text-base">
												{invoice.name}
											</p>
											<p className="text-text-secondary hidden text-sm sm:block">
												{invoice.email}
											</p>
										</div>
									</div>
									<p className="text-text-secondary truncate text-sm font-medium md:text-base">
										{invoice.amount}
									</p>
								</div>
							);
						},
					)}
				</div>
				<div className="text-text-primary flex items-center pt-6 pb-2">
					<ArrowPathIcon className="h-5 w-5" />
					<H3 className="ml-2">Updated just now</H3>
				</div>
			</div>
		</div>
	);
}
