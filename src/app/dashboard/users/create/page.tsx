import type { Metadata } from "next";
import type { JSX } from "react";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import CreateUserForm from "@/src/ui/users/create-user-form";

export const metadata: Metadata = {
	title: "Create User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{
						href: "/dashboard/users",
						label: "Users",
					},
					{
						active: true,
						href: "/dashboard/users/create",
						label: "Create User",
					},
				]}
			/>
			<CreateUserForm />
		</main>
	);
}
