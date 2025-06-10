import { fetchCustomers } from "@/src/lib/data";
import type { CustomerField } from "@/src/lib/definitions/customers";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import CreateInvoiceForm from "@/src/ui/invoices/create-invoice-form";
import type { Metadata } from "next";
import type { JSX } from "react";

export const metadata: Metadata = {
	title: "Create Invoice",
};

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached

export default async function Page(): Promise<JSX.Element> {
	const customers: CustomerField[] = await fetchCustomers();

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{
						label: "Invoices",
						href: "/dashboard/invoices",
					},
					{
						label: "Create Invoice",
						href: "/dashboard/invoices/create",
						active: true,
					},
				]}
			/>
			<CreateInvoiceForm customers={customers} />
		</main>
	);
}
