import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { fetchInvoicesPages } from "@/src/lib/dal/invoices.dal";
import { getDB } from "@/src/lib/db/connection";
import { H1 } from "@/src/ui/headings";
import { CreateInvoice } from "@/src/ui/invoices/buttons";
import Pagination from "@/src/ui/invoices/pagination";
import Table from "@/src/ui/invoices/table";
import { Search } from "@/src/ui/search";
import {
	InvoicesSearchSkeleton,
	InvoicesTableSkeleton,
} from "@/src/ui/skeletons";

export const metadata: Metadata = {
	title: "Invoices",
};

// force this page to be dynamic, so it doesn't get cached
export const dynamic = "force-dynamic";

export interface InvoicesSearchParams {
	query?: string;
	page?: string;
}

export interface InvoicesPageProps {
	searchParams?: Promise<InvoicesSearchParams>;
}

export default async function Page(
	dynamicUrl: InvoicesPageProps,
): Promise<JSX.Element> {
	const db = getDB();
	const searchParams: InvoicesSearchParams | undefined =
		await dynamicUrl.searchParams;
	const query: string = searchParams?.query || "";
	const currentPage: number = Number(searchParams?.page) || 1;
	const totalPages: number = await fetchInvoicesPages(db, query);

	return (
		<div className="w-full">
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
				<Table currentPage={currentPage} query={query} />
			</Suspense>
			<div className="mt-5 flex w-full justify-center">
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	);
}
