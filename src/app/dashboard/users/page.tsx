import type { Metadata } from "next";
import Search from "@/src/ui/search";
import { InvoicesSearchSkeleton } from "@/src/ui/skeletons";
import { Suspense } from "react";
import { CreateUser } from "@/src/ui/users/buttons";
import Pagination from "@/src/ui/invoices/pagination";
import { fetchUsersPages } from "@/src/lib/data";
import UsersTable from "@/src/ui/users/users-table";

export const metadata: Metadata = {
  title: "Users",
};

export const dynamic = "force-dynamic";

export default async function Page(dynamicURL: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>
}) {

  const searchParams = await dynamicURL.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchUsersPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Users</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense fallback={<InvoicesSearchSkeleton />}>
          <Search placeholder="Search users..." />
        </Suspense>
        <CreateUser />
      </div>
      <Suspense key={query + currentPage} fallback={<div>Loading users...</div>}>
        <UsersTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
