import type { JSX } from "react";
import { CUSTOMER_TABLE_HEADERS } from "@/modules/customers/domain/constants";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { CustomersTableDesktopRow } from "@/modules/customers/presentation/components/customers-table-desktop-row";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/ui/atoms/table";

/**
 * Table column definitions for customer data.
 */
const TABLE_COLUMNS = [
	{ key: "name", label: CUSTOMER_TABLE_HEADERS.name },
	{ key: "email", label: CUSTOMER_TABLE_HEADERS.email },
	{ key: "totalInvoices", label: CUSTOMER_TABLE_HEADERS.totalInvoices },
	{ key: "totalPending", label: CUSTOMER_TABLE_HEADERS.totalPending },
	{ key: "totalPaid", label: CUSTOMER_TABLE_HEADERS.totalPaid },
] as const;

type ColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

const HEADER_BASE_CLASS = "py-5 font-medium";

const HEADER_PADDING_MAP: Record<ColumnKey, string> = {
	email: "px-3",
	name: "px-4 sm:pl-6",
	totalInvoices: "px-3",
	totalPaid: "px-4",
	totalPending: "px-3",
};

function getHeaderCellClass(key: ColumnKey): string {
	return `${HEADER_PADDING_MAP[key]} ${HEADER_BASE_CLASS}`;
}

/**
 * Renders a responsive desktop table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export function CustomersTableDesktop({
	customers,
}: {
	customers: FormattedCustomersTableRow[];
}): JSX.Element {
	return (
		<Table
			className="hidden min-w-full rounded-md md:table"
			data-cy="customers-table"
		>
			<TableHeader className="rounded-md bg-bg-accent font-normal text-sm">
				<TableRow className="hover:bg-transparent">
					{TABLE_COLUMNS.map(({ key, label }) => (
						<TableHead
							className={getHeaderCellClass(key)}
							key={key}
							scope="col"
						>
							{label}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody className="divide-y divide-bg-accent">
				{customers.map((customer) => (
					<CustomersTableDesktopRow customer={customer} key={customer.id} />
				))}
			</TableBody>
		</Table>
	);
}
