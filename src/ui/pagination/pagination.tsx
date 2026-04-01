"use client";

import type { UrlObject } from "node:url";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { generatePagination } from "@/ui/pagination/generate-pagination";
import { cn } from "@/ui/utils/cn";

function PaginationNumber({
	href,
	isActive,
	page,
	position,
}: {
	href: UrlObject;
	isActive: boolean;
	page: number | string;
	position?: "first" | "last" | "middle" | "single";
}): JSX.Element {
	const className = cn(
		"flex h-10 w-10 items-center justify-center border text-sm",
		{
			"hover:bg-bg-hover": !isActive && position !== "middle",
			"rounded-l-md": position === "first" || position === "single",
			"rounded-r-md": position === "last" || position === "single",
			"text-text-disabled": position === "middle",
			"z-10 border-bg-active bg-bg-active text-text-inverse": isActive,
		},
	);

	return isActive || position === "middle" ? (
		<div className={className}>{page}</div>
	) : (
		<Link className={className} href={href}>
			{page}
		</Link>
	);
}

function PaginationArrow({
	direction,
	href,
	isDisabled,
}: {
	direction: "left" | "right";
	href: UrlObject;
	isDisabled?: boolean;
}): JSX.Element {
	const className = cn(
		"flex h-10 w-10 items-center justify-center rounded-md border",
		{
			"hover:bg-bg-hover": !isDisabled,
			"ml-2": direction === "right",
			"mr-2": direction === "left",
			"pointer-events-none text-text-disabled": isDisabled,
		},
	);

	const icon =
		direction === "left" ? (
			<ArrowLeftIcon className="w-4" />
		) : (
			<ArrowRightIcon className="w-4" />
		);

	return isDisabled ? (
		<div className={className}>{icon}</div>
	) : (
		<Link className={className} href={href}>
			{icon}
		</Link>
	);
}

function toQueryObject(params: URLSearchParams): Record<string, string> {
	const out: Record<string, string> = {};

	for (const [key, value] of params.entries()) {
		out[key] = value;
	}

	return out;
}

export function Pagination({
	totalPages,
}: {
	totalPages: number;
}): JSX.Element {
	const pathname: string = usePathname();
	const searchParams = useSearchParams();
	const currentPage: number = Number(searchParams.get("page")) || 1;

	const createPageHref = (pageNumber: number | string): UrlObject => {
		const params = new URLSearchParams(searchParams);
		params.set("page", pageNumber.toString());

		return {
			pathname,
			query: toQueryObject(params),
		};
	};

	const allPages = generatePagination(currentPage, totalPages);

	return (
		<div className="inline-flex">
			<PaginationArrow
				direction="left"
				href={createPageHref(currentPage - 1)}
				isDisabled={currentPage <= 1}
			/>

			<div className="flex -space-x-px">
				{allPages.map((page, index) => {
					let position: "first" | "last" | "single" | "middle" | undefined;

					if (index === 0) {
						position = "first";
					}
					if (index === allPages.length - 1) {
						position = "last";
					}
					if (allPages.length === 1) {
						position = "single";
					}
					if (page === "...") {
						position = "middle";
					}

					return (
						<PaginationNumber
							href={createPageHref(page)}
							isActive={currentPage === page}
							// biome-ignore lint/suspicious/noArrayIndexKey: duplicate ellipses may appear
							key={`${page}-${index}`}
							page={page}
							position={position}
						/>
					);
				})}
			</div>

			<PaginationArrow
				direction="right"
				href={createPageHref(currentPage + 1)}
				isDisabled={currentPage >= totalPages}
			/>
		</div>
	);
}
