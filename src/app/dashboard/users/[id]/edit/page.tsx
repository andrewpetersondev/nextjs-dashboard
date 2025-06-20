import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { fetchUserById } from "@/src/lib/dal/users.dal";
import { getDB } from "@/src/lib/db/connection";
import type { UserDTO } from "@/src/lib/dto/user.dto";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import EditUserForm from "@/src/ui/users/edit-user-form";

export const metadata: Metadata = {
	title: "Edit User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export interface EditUserPageParams {
	id: string;
}

export interface EditUserPageProps {
	params: Promise<EditUserPageParams>;
}

// promises are allowed in props params because Partial Pre-Rendering is enabled
export default async function Page(
	props: EditUserPageProps,
): Promise<JSX.Element> {
	const db = getDB("dev");
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
			<EditUserForm user={user} />
		</main>
	);
}
