import type { JSX } from "react";
import { fetchFilteredInvoices } from "@/src/lib/dal/invoices.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import type { FetchFilteredInvoicesData } from "@/src/lib/definitions/invoices.types.ts";
import { DesktopTable } from "@/src/ui/invoices/desktop-table.tsx";
import { MobileTable } from "@/src/ui/invoices/mobile-table.tsx";

export async function InvoicesTable({
	query,
	currentPage,
}: {
	query: string;
	currentPage: number;
}): Promise<JSX.Element> {
	const db = getDB();
	const invoices: FetchFilteredInvoicesData[] = await fetchFilteredInvoices(
		db,
		query,
		currentPage,
	);

	return (
		<div className="mt-6 flow-root">
			<div className="inline-block min-w-full align-middle">
				<div className="bg-bg-accent rounded-lg p-2 md:pt-0">
					<MobileTable invoices={invoices} />
					<DesktopTable invoices={invoices} />
				</div>
			</div>
		</div>
	);
}
