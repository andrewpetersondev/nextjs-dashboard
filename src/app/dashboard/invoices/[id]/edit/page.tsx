import { getDB } from "@/src/db/connection";
import { fetchCustomers } from "@/src/lib/dal/customers.dal";
import { brandInvoiceId, fetchInvoiceById } from "@/src/lib/query/invoices";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import EditInvoiceForm from "@/src/ui/invoices/edit-form";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

export const metadata: Metadata = {
	title: "Edit InvoiceEntity",
};

export const dynamic = "force-dynamic";

export interface EditInvoicePageParams {
	id: string;
}

export interface EditInvoicePageProps {
	params: Promise<EditInvoicePageParams>;
}

export default async function Page(
	props: EditInvoicePageProps,
): Promise<JSX.Element> {
	const db = getDB();
	const { id } = await props.params;

	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(db, brandInvoiceId(id)),
		fetchCustomers(db),
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
						label: "Edit InvoiceEntity",
						href: `/dashboard/invoices/${id}/edit`,
						active: true,
					},
				]}
			/>
			<EditInvoiceForm invoice={invoice} customers={customers} />
		</main>
	);
}
