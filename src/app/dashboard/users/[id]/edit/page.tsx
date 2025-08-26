import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { EditUserFormV2 } from "@/features/users/components/edit-user-form-v2";
import { readUserAction } from "@/server/users/actions/read";
import type { UserDto } from "@/shared/users/dto";
import { Breadcrumbs } from "@/ui/breadcrumbs";
import { H1 } from "@/ui/headings";

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

      <EditUserFormV2 user={user} />
    </main>
  );
}
