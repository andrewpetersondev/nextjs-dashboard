import Form from "@/src/ui/invoices/edit-form";
import Breadcrumbs from "@/src/ui/invoices/breadcrumbs";
import { fetchUsers, fetchUserById } from "@/src/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit User",
};

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [user, users] = await Promise.all([
    fetchUserById(id),
    fetchUsers(),
  ]);
  console.log("Fetched user data:", user);
  console.log("Fetched all users data:", users);
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
      <section>this page should only be accessible to admins.
        <p>Only admins can edit user profiles.</p>
        <p>Regular users can only view their own profile.</p>
        <p>Admins can edit any profile.</p>
      </section>
      {/* <Form profile={profile} customers={customers} /> */}
    </main>
  );
}
