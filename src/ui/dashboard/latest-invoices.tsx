import { fetchLatestInvoices } from "@/src/lib/query/invoices";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";

export default async function LatestInvoices() {
	const latestInvoices = await fetchLatestInvoices();

	return (
		<div className="flex w-full flex-col md:col-span-4">
			<h2 className="mb-4 text-xl md:text-2xl">Latest Invoices</h2>
			<div className="bg-bg-secondary flex grow flex-col justify-between rounded-xl p-4">
				<div className="bg-bg-primary px-6">
					{latestInvoices.map((invoice, i) => {
						return (
							<div
								key={invoice.id}
								className={clsx(
									"flex flex-row items-center justify-between py-4",
									{
										"border-text-secondary border-t": i !== 0,
									},
								)}
							>
								<div className="flex items-center">
									<Image
										src={invoice.image_url}
										alt={`${invoice.name}'s profile picture`}
										className="mr-4 rounded-full"
										width={32}
										height={32}
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
					})}
				</div>
				<div className="text-text-primary flex items-center pt-6 pb-2">
					<ArrowPathIcon className="h-5 w-5" />
					<h3 className="ml-2">Updated just now</h3>
				</div>
			</div>
		</div>
	);
}
