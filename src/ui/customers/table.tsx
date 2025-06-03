import type { FormattedCustomersTable } from "@/src/lib/definitions";
import DesktopTable from "@/src/ui/customers/desktop-table";
import MobileTable from "@/src/ui/customers/mobile-table";
import Search from "@/src/ui/search";

export default async function CustomersTable({
	customers,
}: {
	customers: FormattedCustomersTable[];
}) {
	return (
		<div className="w-full">
			<h1 className="mb-8 text-xl md:text-2xl">Customers</h1>
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
