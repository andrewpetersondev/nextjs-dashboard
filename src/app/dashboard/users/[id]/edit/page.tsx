import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { EditUserForm } from "@/features/users/components/edit-user-form";
import type { UserDto } from "@/features/users/dto/types";
import { readUserAction } from "@/server/users/actions/read";
import { H1 } from "@/ui/atoms/typography/headings";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

interface EditUserPageParams {
  id: string;
}

interface EditUserPageProps {
  params: Promise<EditUserPageParams>;
}

export const metadata: Metadata = {
  title: "Edit User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

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
    </main>
  );
}
