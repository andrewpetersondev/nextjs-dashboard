"use client";

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
  href: string;
  isActive: boolean;
  page: number | string;
  position?: "first" | "last" | "middle" | "single";
}) {
  const className = cn(
    "flex h-10 w-10 items-center justify-center text-sm border",
    {
      "hover:bg-bg-hover": !isActive && position !== "middle",
      "rounded-l-md": position === "first" || position === "single",
      "rounded-r-md": position === "last" || position === "single",
      "text-text-disabled": position === "middle",
      "z-10 bg-bg-active border-bg-active text-text-inverse": isActive,
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
  href: string;
  isDisabled?: boolean;
}) {
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

export function Pagination({
  totalPages,
}: {
  totalPages: number;
}): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        href={createPageUrl(currentPage - 1)}
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
              href={createPageUrl(page)}
              isActive={currentPage === page}
              key={`${page}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <unique enough>
                index
              }`} // Use index to handle duplicate ellipses if any
              page={page}
              position={position}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageUrl(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}
