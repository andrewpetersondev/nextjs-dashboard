import type { JSX } from "react";
import { readFilteredInvoicesAction } from "@/src/lib/actions/invoices.actions";
import type { FetchFilteredInvoicesData } from "@/src/lib/definitions/invoices.types";
import { DesktopTable } from "@/src/ui/invoices/desktop-table";
import { MobileTable } from "@/src/ui/invoices/mobile-table";

/**
 * InvoicesTable component.
 * Fetches filtered invoices using a server action and renders tables.
 */
export async function InvoicesTable({
	query,
	currentPage,
}: {
	query: string;
	currentPage: number;
}): Promise<JSX.Element> {
	const invoices: FetchFilteredInvoicesData[] =
		await readFilteredInvoicesAction(query, currentPage);

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
