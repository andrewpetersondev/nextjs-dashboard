import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { readUserAction } from "@/features/users/user.actions";
import type { UserDto } from "@/features/users/user.dto";
import { H1 } from "@/ui/headings";
import { Breadcrumbs } from "@/ui/invoices/breadcrumbs";
import { EditUserForm } from "@/ui/users/edit-user-form";
import { EditUserFormV2 } from "@/ui/users/edit-user-form-v2";

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

  const user: UserDto | null = await readUserAction(id);

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

      <EditUserForm user={user} />
      <EditUserFormV2 user={user} />
    </main>
  );
}
