import type { Metadata } from "next";
import type { JSX } from "react";
import { CreateUserForm } from "@/modules/users/ui/forms/create-user-form";
import { ROUTES } from "@/shared/routes/routes";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Create User",
};

// force this page to be dynamic, so it doesn't get cached
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const dynamic = "force-dynamic";

export default function Page(): JSX.Element {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            href: ROUTES.dashboard.users,
            label: "Users",
          },
          {
            active: true,
            href: `${ROUTES.dashboard.createUser}`,
            label: "Create User",
          },
        ]}
      />
      <CreateUserForm />
    </main>
  );
}
