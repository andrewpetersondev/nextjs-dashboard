"use client";

import { generatePagination } from "@/src/lib/utils.client";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import {
	type ReadonlyURLSearchParams,
	usePathname,
	useSearchParams,
} from "next/navigation";
import type { JSX } from "react";

export default function Pagination({
	totalPages,
}: { totalPages: number }): JSX.Element {
	const pathname: string = usePathname();
	const searchParams: ReadonlyURLSearchParams = useSearchParams();
	const currentPage: number = Number(searchParams.get("page")) || 1;
	const allPages: (string | number)[] = generatePagination(
		currentPage,
		totalPages,
	);

	const createPageURL = (pageNumber: number | string): string => {
		const params = new URLSearchParams(searchParams);
		params.set("page", pageNumber.toString());
		return `${pathname}?${params.toString()}`;
	};

	return (
		<>
			<div className="inline-flex">
				<PaginationArrow
					direction="left"
					href={createPageURL(currentPage - 1)}
					isDisabled={currentPage <= 1}
				/>

				<div className="flex -space-x-px">
					{allPages.map((page: string | number, index: number): JSX.Element => {
						let position: "first" | "last" | "single" | "middle" | undefined;

						if (index === 0) position = "first";
						if (index === allPages.length - 1) position = "last";
						if (allPages.length === 1) position = "single";
						if (page === "...") position = "middle";

						return (
							<PaginationNumber
								key={page}
								href={createPageURL(page)}
								page={page}
								position={position}
								isActive={currentPage === page}
							/>
						);
					})}
				</div>

				<PaginationArrow
					direction="right"
					href={createPageURL(currentPage + 1)}
					isDisabled={currentPage >= totalPages}
				/>
			</div>
		</>
	);
}

function PaginationNumber({
	page,
	href,
	isActive,
	position,
}: {
	page: number | string;
	href: string;
	position?: "first" | "last" | "middle" | "single";
	isActive: boolean;
}): JSX.Element {
	const className: string = clsx(
		"flex h-10 w-10 items-center justify-center border",
		{
			"rounded-l-md": position === "first" || position === "single",
			"rounded-r-md": position === "last" || position === "single",
			"z-10 border-bg-active border-2 border-bg-focus text-text-active":
				isActive,
			"hover:bg-bg-hover": !isActive && position !== "middle",
			"text-text-secondary": position === "middle",
		},
	);

	return isActive || position === "middle" ? (
		<div className={className}>{page}</div>
	) : (
		<Link href={href} className={className}>
			{page}
		</Link>
	);
}

function PaginationArrow({
	href,
	direction,
	isDisabled,
}: {
	href: string;
	direction: "left" | "right";
	isDisabled?: boolean;
}): JSX.Element {
	const className: string = clsx(
		"flex h-10 w-10 items-center justify-center rounded-md border",
		{
			"pointer-events-none text-text-disabled": isDisabled,
			"hover:bg-bg-disabled": !isDisabled,
			"mr-2 md:mr-4": direction === "left",
			"ml-2 md:ml-4": direction === "right",
		},
	);

	const icon: JSX.Element =
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
