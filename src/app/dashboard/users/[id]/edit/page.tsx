import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import { readUserAction } from "@/modules/users/server/application/actions/read-user.action";
import { UpdateUserForm } from "@/modules/users/ui/forms/update-user-form";
import { H1 } from "@/ui/atoms/headings";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

interface EditUserPageParams {
  id: string;
}

interface EditUserPageProps {
  params: Promise<EditUserPageParams>;
}

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Edit User",
};

// force this page to be dynamic, so it doesn't get cached
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
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

      <UpdateUserForm user={user} />
    </main>
  );
}
