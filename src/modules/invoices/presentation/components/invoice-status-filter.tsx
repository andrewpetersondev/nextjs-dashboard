"use client";

import type { Route } from "next";
import {
	type ReadonlyURLSearchParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import { type JSX, useCallback } from "react";
import {
	INVOICE_STATUS_FILTERS,
	type InvoiceStatusFilter,
	parseInvoiceStatusFilter,
} from "@/modules/invoices/domain/statuses/invoice-status.filter";
import { cn } from "@/ui/utils/cn";

const FILTER_LABELS: Record<InvoiceStatusFilter, string> = {
	all: "All",
	overdue: "Overdue",
	paid: "Paid",
	pending: "Pending",
	void: "Void",
};

function FilterPill({
	active,
	label,
	onSelect,
	value,
}: {
	active: boolean;
	label: string;
	onSelect: (value: InvoiceStatusFilter) => void;
	value: InvoiceStatusFilter;
}): JSX.Element {
	const handleClick = useCallback((): void => {
		onSelect(value);
	}, [onSelect, value]);

	return (
		<button
			aria-pressed={active}
			className={cn(
				"rounded-full border px-3 py-1.5 font-medium text-xs transition-colors",
				active
					? "border-bg-accent bg-bg-accent text-text-primary"
					: "border-bg-accent text-text-secondary hover:text-text-hover",
			)}
			data-cy={`invoice-status-filter-${value}`}
			onClick={handleClick}
			type="button"
		>
			{label}
		</button>
	);
}

/**
 * URL-driven status filter for the invoices list. Mirrors SearchBoxMolecule's
 * param handling: touches only its own "status" key (plus the page reset), so
 * query/status/page compose freely and the URL stays shareable.
 */
export function InvoiceStatusFilterControl(): JSX.Element {
	const searchParams: ReadonlyURLSearchParams = useSearchParams();
	const pathname: string = usePathname();
	const { replace } = useRouter();

	const current = parseInvoiceStatusFilter(searchParams.get("status"));

	const applyFilter = useCallback(
		(value: InvoiceStatusFilter): void => {
			const params = new URLSearchParams(searchParams);
			// A filter change re-partitions the list; stale page numbers can strand
			// the user past the last page.
			params.set("page", "1");
			if (value === "all") {
				params.delete("status");
			} else {
				params.set("status", value);
			}

			const queryString = params.toString();
			const nextHref = (
				queryString ? `${pathname}?${queryString}` : pathname
			) as Route;

			replace(nextHref);
		},
		[searchParams, pathname, replace],
	);

	return (
		<fieldset className="m-0 border-0 p-0">
			<legend className="sr-only">Filter invoices by status</legend>
			<div className="flex flex-wrap gap-2">
				{INVOICE_STATUS_FILTERS.map(
					(value): JSX.Element => (
						<FilterPill
							active={current === value}
							key={value}
							label={FILTER_LABELS[value]}
							onSelect={applyFilter}
							value={value}
						/>
					),
				)}
			</div>
		</fieldset>
	);
}
