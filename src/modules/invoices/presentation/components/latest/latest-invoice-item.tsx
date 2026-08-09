import clsx from "clsx";
import type { JSX } from "react";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import { formatCurrency } from "@/shared/primitives/money/convert";
import { AvatarMolecule } from "@/ui/molecules/avatar.molecule";

interface LatestInvoiceItemProps {
	readonly hasTopBorder: boolean;
	readonly invoice: InvoiceListFilter;
}

/**
 * One row of the dashboard's latest-invoices panel.
 *
 * `hasTopBorder` is the caller's job because only the first item should go
 * without one — the separator belongs to the list's rhythm, not to the item.
 */
export function LatestInvoiceItem({
	invoice,
	hasTopBorder,
}: LatestInvoiceItemProps): JSX.Element {
	return (
		<div
			className={clsx("flex flex-row items-center justify-between py-4", {
				"border-text-secondary border-t": hasTopBorder,
			})}
			data-cy="latest-invoices-item"
			key={invoice.id}
		>
			<div className="flex items-center">
				<AvatarMolecule
					className="mr-4"
					imageUrl={invoice.imageUrl}
					name={invoice.name}
				/>
				<div className="min-w-0">
					<p className="truncate font-semibold text-sm text-text-secondary md:text-base">
						{invoice.name}
					</p>
					<p className="hidden text-sm text-text-secondary sm:block">
						{invoice.email}
					</p>
				</div>
			</div>
			<p className="truncate font-medium text-sm text-text-secondary md:text-base">
				{formatCurrency(invoice.amount)}
			</p>
		</div>
	);
}
