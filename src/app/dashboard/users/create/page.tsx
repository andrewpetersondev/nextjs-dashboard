import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import CreateUserForm from "@/src/ui/users/create-user-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export default async function Page() {
	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{
						label: "Users",
						href: "/dashboard/users",
					},
					{
						label: "Create User",
						href: "/dashboard/users/create",
						active: true,
					},
				]}
			/>
			<CreateUserForm />
		</main>
	);
}
