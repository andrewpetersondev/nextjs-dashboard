import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { InvoicesSearchSkeleton } from "@/modules/invoices/presentation/components/invoices.skeletons";
import { readUsersPageCountAction } from "@/modules/users/presentation/actions/read-users-page-count.action";
import { UsersTable } from "@/modules/users/presentation/components/tables/users-table";
import { CreateUserLink } from "@/modules/users/presentation/components/user-action-buttons";
import { H1 } from "@/ui/atoms/headings";
import { SearchBoxMolecule } from "@/ui/molecules/search-box.molecule";
import { Pagination } from "@/ui/pagination/pagination";

interface UsersSearchParams {
  query?: string;
  page?: string;
}

interface UsersPageProps {
  searchParams?: Promise<UsersSearchParams>;
}

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Users",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const dynamic = "force-dynamic";

export default async function Page(
  dynamicUrl: UsersPageProps,
): Promise<JSX.Element> {
  const searchParams: UsersSearchParams | undefined =
    await dynamicUrl.searchParams;

  const query = searchParams?.query || "";

  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await readUsersPageCountAction(query);

  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between">
        <H1>Users</H1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense fallback={<InvoicesSearchSkeleton />}>
          <SearchBoxMolecule placeholder="Search users..." />
        </Suspense>
        <CreateUserLink />
      </div>
      <Suspense
        fallback={<div>Loading users...</div>}
        key={query + currentPage}
      >
        <UsersTable currentPage={currentPage} query={query} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  );
}
