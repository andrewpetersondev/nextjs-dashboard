import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import type { InvoiceId } from "@/modules/invoices/domain/types/invoice-id.brand";

import type { Period } from "@/shared/primitives/period/period.brand";

/**
 * Row for invoice table queries (with customer info).
 * Used in invoice list views and table components.
 */
export type InvoiceListFilter = Readonly<{
	amount: number;
	customerId: CustomerId;
	date: Date;
	email: string;
	id: InvoiceId;
	imageUrl: string;
	name: string;
	revenuePeriod: Period;
	sensitiveData: string;
	status: InvoiceStatus;
}>;
