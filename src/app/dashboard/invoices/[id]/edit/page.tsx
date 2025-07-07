import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { readCustomersAction } from "@/src/lib/actions/customers.actions";
import { readInvoiceAction } from "@/src/lib/actions/invoices.actions";
import type { CustomerField } from "@/src/lib/definitions/customers.types";
import type { InvoiceDto } from "@/src/lib/dto/invoice.dto";
import { H1 } from "@/src/ui/headings";
import { Breadcrumbs } from "@/src/ui/invoices/breadcrumbs";
import { EditInvoiceForm } from "@/src/ui/invoices/edit-invoice-form";

export const metadata: Metadata = {
	title: "Edit Invoice",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
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
	const { id } = await props.params;

	const [customers, invoice]: [CustomerField[], InvoiceDto | null] =
		await Promise.all([readCustomersAction(), readInvoiceAction(id)]);

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
			<H1>edit invoice</H1>

			<section>
				<p>Edit some stuff.</p>
			</section>

			<EditInvoiceForm customers={customers} invoice={invoice} />
		</main>
	);
}
