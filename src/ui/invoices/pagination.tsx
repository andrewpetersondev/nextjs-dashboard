"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import {
  type ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import type { JSX } from "react";
import { generatePagination } from "@/lib/utils/utils";

export const Pagination = ({
  totalPages,
}: {
  totalPages: number;
}): JSX.Element => {
  const pathname: string = usePathname();
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const currentPage: number = Number(searchParams.get("page")) || 1;
  const allPages: (string | number)[] = generatePagination(
    currentPage,
    totalPages,
  );

  const createPageUrl = (pageNumber: number | string): string => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        href={createPageUrl(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="-space-x-px flex">
        {allPages.map((page: string | number, index: number): JSX.Element => {
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
              key={page}
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
};

const PaginationNumber = ({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}): JSX.Element => {
  const className: string = clsx(
    "flex h-10 w-10 items-center justify-center border",
    {
      "hover:bg-bg-hover": !isActive && position !== "middle",
      "rounded-l-md": position === "first" || position === "single",
      "rounded-r-md": position === "last" || position === "single",
      "text-text-secondary": position === "middle",
      "z-10 border-bg-active border-2 border-bg-focus text-text-active":
        isActive,
    },
  );

  return isActive || position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <Link className={className} href={href}>
      {page}
    </Link>
  );
};

const PaginationArrow = ({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}): JSX.Element => {
  const className: string = clsx(
    "flex h-10 w-10 items-center justify-center rounded-md border",
    {
      "hover:bg-bg-disabled": !isDisabled,
      "ml-2 md:ml-4": direction === "right",
      "mr-2 md:mr-4": direction === "left",
      "pointer-events-none text-text-disabled": isDisabled,
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
};
