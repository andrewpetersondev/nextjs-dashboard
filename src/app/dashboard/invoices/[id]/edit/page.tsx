import { fetchCustomers } from "@/src/lib/data";
import { fetchInvoiceById } from "@/src/lib/query/invoices";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import EditInvoiceForm from "@/src/ui/invoices/edit-form";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
	title: "Edit Invoice",
};

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const id = params.id;
	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(id),
		fetchCustomers(),
	]);
	if (!invoice) {
		notFound();
	}
	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{ label: "Invoices", href: "/dashboard/invoices" },
					{
						label: "Edit Invoice",
						href: `/dashboard/invoices/${id}/edit`,
						active: true,
					},
				]}
			/>
			<EditInvoiceForm invoice={invoice} customers={customers} />
		</main>
	);
}
