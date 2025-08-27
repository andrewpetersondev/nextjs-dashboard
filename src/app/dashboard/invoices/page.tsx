import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { CreateInvoice } from "@/features/invoices/components/buttons";
import { Pagination } from "@/features/invoices/components/pagination";
import { InvoicesTable } from "@/features/invoices/components/table";
import { readInvoicesPagesAction } from "@/server/invoices/actions/read-pages";
import { H1 } from "@/ui/primitives/headings";
import { Search } from "@/ui/search";
import { InvoicesSearchSkeleton, InvoicesTableSkeleton } from "@/ui/skeletons";

interface InvoicesSearchParams {
  query?: string;
  page?: string;
}

interface InvoicesPageProps {
  searchParams?: Promise<InvoicesSearchParams>;
}

export const metadata: Metadata = {
  title: "Invoices",
};

// force this page to be dynamic, so it doesn't get cached. Why?
export const dynamic = "force-dynamic";

export default async function Page(
  dynamicUrl: InvoicesPageProps,
): Promise<JSX.Element> {
  // The Page Component can read url search params because Search Component sets them.
  const searchParams: InvoicesSearchParams | undefined =
    await dynamicUrl.searchParams;

  const query: string = searchParams?.query || "";

  const currentPage: number = Number(searchParams?.page) || 1;

  const totalPages: number = await readInvoicesPagesAction(query);

  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between">
        <H1>Invoices</H1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Suspense fallback={<InvoicesSearchSkeleton />}>
          <Search placeholder="Search invoices..." />
        </Suspense>
        <CreateInvoice />
      </div>
      <Suspense fallback={<InvoicesTableSkeleton />} key={query + currentPage}>
        <InvoicesTable currentPage={currentPage} query={query} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  );
}
