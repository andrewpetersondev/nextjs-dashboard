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

export default function Search({
	placeholder,
}: { placeholder: string }): JSX.Element {
	const searchParams: ReadonlyURLSearchParams = useSearchParams();
	const pathname: string = usePathname();
	const { replace } = useRouter();

	const handleSearch = useDebouncedCallback((term): void => {
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
			<label htmlFor="search" className="sr-only">
				Search
			</label>
			<input
				className="peer focus:ring-opacity-20 block w-full rounded-md border border-[color:var(--color-text-active)] bg-[color:var(--color-bg-primary)] py-[9px] pl-10 text-sm text-[color:var(--color-text-primary)] outline-2 transition-colors duration-200 placeholder:text-[color:var(--color-text-disabled)] hover:border-[color:var(--color-text-hover)] focus:border-[color:var(--color-text-focus)] focus:ring-2 focus:ring-[color:var(--color-bg-focus)] focus:outline-none"
				placeholder={placeholder}
				onChange={(e: ChangeEvent<HTMLInputElement>): void => {
					handleSearch(e.target.value);
				}}
				defaultValue={searchParams.get("query")?.toString()}
			/>
			<MagnifyingGlassIcon className="peer-focus:text-text-focus absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-text-accent" />
		</div>
	);
}
