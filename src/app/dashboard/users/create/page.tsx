import type { Metadata } from "next";
import type { JSX } from "react";
import { Breadcrumbs } from "@/src/ui/invoices/breadcrumbs.tsx";
import { CreateUserForm } from "@/src/ui/users/create-user-form.tsx";
import { CreateUserFormV2 } from "@/src/ui/users/create-user-form-v2.tsx";

// biome-ignore lint/style/useComponentExportOnlyModules: ignore this rule
export const metadata: Metadata = {
	title: "Create User",
};

// force this page to be dynamic, so it doesn't get cached
// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this format
export const dynamic = "force-dynamic";

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
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
			<CreateUserFormV2 />
		</main>
	);
}
