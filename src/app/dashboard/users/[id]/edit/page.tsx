import { fetchUserById } from "@/src/dal/users";
import type { UserDTO } from "@/src/dto/user.dto";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import EditUserForm from "@/src/ui/users/edit-user-form";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";

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
	const { id } = await props.params;

	const user: UserDTO | null = await fetchUserById(id);

	if (!user) {
		notFound();
	}

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{ label: "Users", href: "/dashboard/users" },
					{
						label: "Edit User",
						href: `/dashboard/users/${id}/edit`,
						active: true,
					},
				]}
			/>
			<EditUserForm user={user} />
		</main>
	);
}
