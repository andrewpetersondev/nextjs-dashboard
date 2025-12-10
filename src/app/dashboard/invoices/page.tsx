import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { readInvoicesPagesAction } from "@/modules/invoices/server/application/actions/read-pages";
import { CreateInvoice } from "@/modules/invoices/ui/components/buttons";
import {
  InvoicesSearchSkeleton,
  InvoicesTableSkeleton,
} from "@/modules/invoices/ui/components/invoices.skeletons";
import { InvoicesTable } from "@/modules/invoices/ui/components/table/table";
import { H1 } from "@/ui/atoms/headings";
import { SearchBoxMolecule } from "@/ui/molecules/search-box.molecule";
import { Pagination } from "@/ui/pagination/pagination";

interface InvoicesSearchParams {
  query?: string;
  page?: string;
}

interface InvoicesPageProps {
  searchParams?: Promise<InvoicesSearchParams>;
}

// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
export const metadata: Metadata = {
  title: "Invoices",
};

// force this page to be dynamic, so it doesn't get cached. Why?
// biome-ignore lint/style/useComponentExportOnlyModules: <learn about this change in nextjs 16>
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
          <SearchBoxMolecule placeholder="Search invoices..." />
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
