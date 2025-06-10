import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers";
import Image from "next/image";
import type { JSX } from "react";

export default async function MobileTable({
	customers,
}: { customers: FormattedCustomersTableRow[] }): Promise<JSX.Element> {
	return (
		<div className="md:hidden">
			{customers?.map(
				(customer: FormattedCustomersTableRow): JSX.Element => (
					<div
						key={customer.id}
						className="bg-bg-primary mb-2 w-full rounded-md p-4"
					>
						{/* Customer info: name, profile picture, and email */}
						<div className="flex items-center justify-between border-b pb-4">
							<div>
								<div className="mb-2 flex items-center">
									<div className="flex items-center gap-3">
										<Image
											src={customer.imageUrl}
											className="rounded-full"
											alt={`${customer.name}'s profile picture`}
											width={28}
											height={28}
										/>
										<p>{customer.name}</p>
									</div>
								</div>
								<p className="text-text-primary text-sm">{customer.email}</p>
							</div>
						</div>

						{/* Customer financial details: pending and paid amounts */}
						<div className="flex w-full items-center justify-between border-b py-5">
							<div className="flex w-1/2 flex-col">
								<p className="text-xs">Pending</p>
								<p className="font-medium">{customer.totalPending}</p>
							</div>
							<div className="flex w-1/2 flex-col">
								<p className="text-xs">Paid</p>
								<p className="font-medium">{customer.totalPaid}</p>
							</div>
						</div>

						{/* Customer invoice total */}
						<div className="pt-4 text-sm">
							<p>{customer.totalInvoices} invoices</p>
						</div>
					</div>
				),
			)}
		</div>
	);
}
