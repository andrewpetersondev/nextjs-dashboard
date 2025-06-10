import type { UserDTO } from "@/src/dto/user.dto";
import { fetchUserById } from "@/src/lib/query/users";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import EditUserForm from "@/src/ui/users/edit-user-form";
import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import type { JSX } from "react";

export const metadata: Metadata = {
	title: "Edit User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export default async function Page(props: {
	params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
	const params: { id: string } = await props.params;
	const id: string = params.id;
	const user: UserDTO = await fetchUserById(id);
	if (!user.role.includes("admin")) {
		// throw new Error("You are not allowed to edit this user.");
		forbidden();
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
			<section>
				<p>Admins can edit any profile.</p>
			</section>
			<EditUserForm user={user} />
		</main>
	);
}
