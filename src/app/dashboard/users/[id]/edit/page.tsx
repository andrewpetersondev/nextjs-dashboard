import { fetchUserById, fetchUsers } from "@/src/lib/query/users";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
// import EditUserForm from "@/src/ui/users/edit-user-form";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
	title: "Edit User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const id = params.id;
	const [user, users] = await Promise.all([fetchUserById(id), fetchUsers()]);

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
			<section>
				<p>Admins can edit any profile.</p>
			</section>
			{/*<EditUserForm user={user} users={users} />*/}
		</main>
	);
}
