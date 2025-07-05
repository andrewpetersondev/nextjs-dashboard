import type { Metadata } from "next";
import type { JSX } from "react";
import { fetchCustomers } from "@/src/lib/dal/customers.dal";
import { getDB } from "@/src/lib/db/connection";
import type { CustomerField } from "@/src/lib/definitions/customers.types";
import { Breadcrumbs } from "@/src/ui/invoices/breadcrumbs";
import { CreateInvoiceForm } from "@/src/ui/invoices/create-invoice-form";

export const metadata: Metadata = {
	title: "Create Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
	const db = getDB();
	const customers: CustomerField[] = await fetchCustomers(db);

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{
						href: "/dashboard/invoices",
						label: "Invoices",
					},
					{
						active: true,
						href: "/dashboard/invoices/create",
						label: "Create Invoice",
					},
				]}
			/>
			<CreateInvoiceForm customers={customers} />
		</main>
	);
}
