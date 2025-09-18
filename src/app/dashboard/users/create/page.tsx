import type { Metadata } from "next";
import type { JSX } from "react";
import { CreateUserForm } from "@/features/users/components/create-user-form";
import { Breadcrumbs } from "@/ui/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Create User",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export default function Page(): JSX.Element {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            href: "/dashboard/users",
            label: "Users",
          },
          {
            active: true,
            href: "/dashboard/users/create",
            label: "Create User",
          },
        ]}
      />
      <CreateUserForm />
    </main>
  );
}
