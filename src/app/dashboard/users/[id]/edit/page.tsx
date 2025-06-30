import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { fetchUserById } from "@/src/lib/dal/users.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import type { UserDTO } from "@/src/lib/dto/user.dto.ts";
import { H1 } from "@/src/ui/headings.tsx";
import { Breadcrumbs } from "@/src/ui/invoices/breadcrumbs.tsx";
import { EditUserFormV2 } from "@/src/ui/users/edit-user-form-v2.tsx";

// biome-ignore lint/style/useComponentExportOnlyModules:  ignore this rule
export const metadata: Metadata = {
	title: "Edit User",
};

// force this page to be dynamic, so it doesn't get cached
// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this format
export const dynamic = "force-dynamic";

export interface EditUserPageParams {
	id: string;
}

export interface EditUserPageProps {
	params: Promise<EditUserPageParams>;
}

// promises are allowed in props params because Partial Pre-Rendering is enabled
// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
export default async function Page(
	props: EditUserPageProps,
): Promise<JSX.Element> {
	const db = getDB();
	const { id } = await props.params;

	const user: UserDTO | null = await fetchUserById(db, id);

	if (!user) {
		notFound();
	}

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{ href: "/dashboard/users", label: "Users" },
					{
						active: true,
						href: `/dashboard/users/${id}/edit`,
						label: "Edit User",
					},
				]}
			/>

			<H1>edit user form </H1>

			<section>
				<p>Admins can edit any profile.</p>
			</section>

			{/*<EditUserForm user={user} />*/}
			<EditUserFormV2 user={user} />
		</main>
	);
}
