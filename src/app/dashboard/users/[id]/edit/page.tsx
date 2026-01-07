import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import type { UserDto } from "@/modules/users/application/dto/user.dto";
import { readUserAction } from "@/modules/users/infrastructure/actions/read-user.action";
import { EditUserForm } from "@/modules/users/presentation/forms/edit-user-form";
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

      <EditUserForm user={user} />
    </main>
  );
}
