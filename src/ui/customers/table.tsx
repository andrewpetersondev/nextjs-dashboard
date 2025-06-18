import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers";
import DesktopTable from "@/src/ui/customers/desktop-table";
import MobileTable from "@/src/ui/customers/mobile-table";
import { H1 } from "@/src/ui/headings";
import Search from "@/src/ui/search";

export default async function CustomersTable({
	customers,
}: {
	customers: FormattedCustomersTableRow[];
}): Promise<JSX.Element> {
	return (
		<div className="w-full">
			<H1 className="mb-8">Customers</H1>
			<Search placeholder="Search customers..." />
			<div className="mt-6 flow-root">
				<div className="overflow-x-auto">
					<div className="inline-block min-w-full align-middle">
						<div className="bg-bg-accent overflow-hidden rounded-md p-2 md:pt-0">
							<MobileTable customers={customers} />
							<DesktopTable customers={customers} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
