import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { readUsersPagesAction } from "@/features/users/user.actions";
import { H1 } from "@/ui/headings";
import { Pagination } from "@/ui/invoices/pagination";
import { Search } from "@/ui/search";
import { InvoicesSearchSkeleton } from "@/ui/skeletons";
import { CreateUser } from "@/ui/users/buttons";
import { UsersTable } from "@/ui/users/users-table";

export const metadata: Metadata = {
  title: "Users",
};

// force this page to be dynamic, so it doesn't get cached. otherwise, the next build will fail
export const dynamic = "force-dynamic";

interface UsersSearchParams {
  query?: string;
  page?: string;
}

interface UsersPageProps {
  searchParams?: Promise<UsersSearchParams>;
}

export default async function Page(
  dynamicUrl: UsersPageProps,
): Promise<JSX.Element> {
  const searchParams: UsersSearchParams | undefined =
    await dynamicUrl.searchParams;

  const query: string = searchParams?.query || "";

  const currentPage: number = Number(searchParams?.page) || 1;

  const totalPages: number = await readUsersPagesAction(query);

  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between">
        <H1>Users</H1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense fallback={<InvoicesSearchSkeleton />}>
          <Search placeholder="Search users..." />
        </Suspense>
        <CreateUser />
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
