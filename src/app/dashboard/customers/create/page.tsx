import type { Metadata } from "next";
import type { JSX } from "react";
import { CreateCustomerForm } from "@/modules/customers/presentation/forms/create-customer-form";
import { ROUTES } from "@/shared/routing/routes";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

export const metadata: Metadata = {
	title: "Create Customer",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export default function Page(): JSX.Element {
	return (
		<>
			<Breadcrumbs
				breadcrumbs={[
					{
						href: ROUTES.dashboard.customers,
						label: "Customers",
					},
					{
						active: true,
						href: ROUTES.dashboard.createCustomer(),
						label: "Create Customer",
					},
				]}
			/>
			<CreateCustomerForm />
		</>
	);
}
