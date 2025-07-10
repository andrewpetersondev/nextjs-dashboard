"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
	type ReadonlyURLSearchParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import type { ChangeEvent, JSX } from "react";
import { useDebouncedCallback } from "use-debounce";

/**
 * Search component for filtering data.
 */
export function Search({ placeholder }: { placeholder: string }): JSX.Element {
	const searchParams: ReadonlyURLSearchParams = useSearchParams();
	const pathname: string = usePathname();
	const { replace } = useRouter();

	const handleSearch = useDebouncedCallback((term: string): void => {
		const params = new URLSearchParams(searchParams);
		params.set("page", "1");
		if (term) {
			params.set("query", term);
		} else {
			params.delete("query");
		}
		replace(`${pathname}?${params.toString()}`);
	}, 3000);

	return (
		<div className="relative flex flex-1 shrink-0">
			<label className="sr-only" htmlFor="search">
				Search
			</label>
			<input
				aria-label={placeholder}
				autoComplete="off"
				className="peer block w-full rounded-md border border-[color:var(--color-text-active)] bg-[color:var(--color-bg-primary)] py-[9px] pl-10 text-[color:var(--color-text-primary)] text-sm outline-2 transition-colors duration-200 placeholder:text-[color:var(--color-text-disabled)] hover:border-[color:var(--color-text-hover)] focus:border-[color:var(--color-text-focus)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-focus)] focus:ring-opacity-20"
				defaultValue={searchParams.get("query")?.toString()}
				id="search"
				onChange={(e: ChangeEvent<HTMLInputElement>): void => {
					handleSearch(e.target.value);
				}}
				placeholder={placeholder}
				type="search"
			/>
			<MagnifyingGlassIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-[18px] w-[18px] text-text-accent peer-focus:text-text-focus" />
		</div>
	);
}
