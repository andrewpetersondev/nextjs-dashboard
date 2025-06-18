import { getDB } from "@/src/db/connection";
import { fetchCustomers } from "@/src/lib/data";
import type { CustomerField } from "@/src/lib/definitions/customers";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import CreateInvoiceForm from "@/src/ui/invoices/create-invoice-form";
import type { Metadata } from "next";
import type { JSX } from "react";

export const metadata: Metadata = {
	title: "Create InvoiceEntity",
};

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached

export default async function Page(): Promise<JSX.Element> {
	const db = getDB();
	const customers: CustomerField[] = await fetchCustomers(db);

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{
						label: "Invoices",
						href: "/dashboard/invoices",
					},
					{
						label: "Create InvoiceEntity",
						href: "/dashboard/invoices/create",
						active: true,
					},
				]}
			/>
			<CreateInvoiceForm customers={customers} />
		</main>
	);
}
