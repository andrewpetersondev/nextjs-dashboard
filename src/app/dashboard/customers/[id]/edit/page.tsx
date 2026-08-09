import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import type { CustomerDto } from "@/modules/customers/application/dtos/customer.dto";
import { readCustomerByIdAction } from "@/modules/customers/presentation/actions/read-customer-by-id.action";
import { EditCustomerForm } from "@/modules/customers/presentation/forms/edit-customer-form";
import { ROUTES } from "@/shared/routing/routes";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

interface EditCustomerPageParams {
	id: string;
}

interface EditCustomerPageProps {
	params: Promise<EditCustomerPageParams>;
}

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
	title: "Edit Customer",
};

// force this page to be dynamic, so it doesn't get cached
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const dynamic = "force-dynamic";

// promises are allowed in props params because Partial Pre-Rendering is enabled
export default async function Page(
	props: EditCustomerPageProps,
): Promise<JSX.Element> {
	const { id } = await props.params;

	const customer: CustomerDto | null = await readCustomerByIdAction(id);

	if (!customer) {
		notFound();
	}

	return (
		<>
			<Breadcrumbs
				breadcrumbs={[
					{ href: ROUTES.dashboard.customers, label: "Customers" },
					{
						active: true,
						href: ROUTES.dashboard.customerEdit(id),
						label: "Edit Customer",
					},
				]}
			/>

			<EditCustomerForm customer={customer} />
		</>
	);
}
