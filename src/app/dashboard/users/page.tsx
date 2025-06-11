import { fetchUsersPages } from "@/src/dal/users";
import Pagination from "@/src/ui/invoices/pagination";
import Search from "@/src/ui/search";
import { InvoicesSearchSkeleton } from "@/src/ui/skeletons";
import { CreateUser } from "@/src/ui/users/buttons";
import UsersTable from "@/src/ui/users/users-table";
import type { Metadata } from "next";
import { type JSX, Suspense } from "react";

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
	dynamicURL: UsersPageProps,
): Promise<JSX.Element> {
	const searchParams: UsersSearchParams | undefined =
		await dynamicURL.searchParams;
	const query: string = searchParams?.query || "";
	const currentPage: number = Number(searchParams?.page) || 1;
	const totalPages: number = await fetchUsersPages(query);

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
			<Suspense
				key={query + currentPage}
				fallback={<div>Loading users...</div>}
			>
				<UsersTable query={query} currentPage={currentPage} />
			</Suspense>
			<div className="mt-5 flex w-full justify-center">
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	);
}
