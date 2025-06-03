import Pagination from "@/src/ui/invoices/pagination";
import Search from "@/src/ui/search";
import Table from "@/src/ui/invoices/table";
import { CreateInvoice } from "@/src/ui/invoices/buttons";
import { InvoicesTableSkeleton } from "@/src/ui/skeletons";
import { Suspense } from "react";
import { InvoicesSearchSkeleton } from "@/src/ui/skeletons";
import { fetchInvoicesPages } from "@/src/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices",
};

export const dynamic = "force-dynamic"; // force this page to be dynamic, so it doesn't get cached

export default async function Page(dynamicURL: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await dynamicURL.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInvoicesPages(query);
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense fallback={<InvoicesSearchSkeleton />}>
          <Search placeholder="Search invoices..." />
        </Suspense>
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
