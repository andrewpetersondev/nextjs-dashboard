import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { fetchCustomers } from "@/src/lib/dal/customers.dal.ts";
import {
	brandInvoiceId,
	fetchInvoiceById,
} from "@/src/lib/dal/invoices.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import { Breadcrumbs } from "@/src/ui/invoices/breadcrumbs.tsx";
import { EditInvoiceForm } from "@/src/ui/invoices/edit-invoice-form.tsx";

// biome-ignore lint/style/useComponentExportOnlyModules: ignore this rule
export const metadata: Metadata = {
	title: "Edit InvoiceEntity",
};

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this format
export const dynamic = "force-dynamic";

export interface EditInvoicePageParams {
	id: string;
}

export interface EditInvoicePageProps {
	params: Promise<EditInvoicePageParams>;
}

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
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
					{ href: "/dashboard/invoices", label: "Invoices" },
					{
						active: true,
						href: `/dashboard/invoices/${id}/edit`,
						label: "Edit Invoice",
					},
				]}
			/>
			<EditInvoiceForm customers={customers} invoice={invoice} />
		</main>
	);
}
