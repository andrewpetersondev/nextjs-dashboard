import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { fetchUsersPages } from "@/src/lib/dal/users.dal";
import { getDB } from "@/src/lib/db/connection";
import { H1 } from "@/src/ui/headings";
import Pagination from "@/src/ui/invoices/pagination";
import { Search } from "@/src/ui/search";
import { InvoicesSearchSkeleton } from "@/src/ui/skeletons";
import { CreateUser } from "@/src/ui/users/buttons";
import { UsersTable } from "@/src/ui/users/users-table";

export const metadata: Metadata = {
	title: "Users",
};

export const dynamic = "force-dynamic";

export interface UsersSearchParams {
	query?: string;
	page?: string;
}

export interface UsersPageProps {
	searchParams?: Promise<UsersSearchParams>;
}

export default async function Page(
	dynamicUrl: UsersPageProps,
): Promise<JSX.Element> {
	const db = getDB();
	const searchParams: UsersSearchParams | undefined =
		await dynamicUrl.searchParams;
	const query: string = searchParams?.query || "";
	const currentPage: number = Number(searchParams?.page) || 1;
	const totalPages: number = await fetchUsersPages(db, query);

	return (
		<div className="w-full">
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
		</div>
	);
}
