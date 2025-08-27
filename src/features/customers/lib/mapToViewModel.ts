import type {
  CustomerAggregatesServerDto,
  CustomerField,
  CustomerSelectServerDto,
  FormattedCustomersTableRow,
} from "@/features/customers/types";
import { formatCurrency } from "@/shared/money/convert";

export const toCustomerField = (
  row: CustomerSelectServerDto,
): CustomerField => ({
  id: row.id,
  name: row.name,
});

export const toFormattedCustomersTableRow = (
  row: CustomerAggregatesServerDto,
): FormattedCustomersTableRow => ({
  email: row.email,
  id: row.id,
  imageUrl: row.imageUrl,
  name: row.name,
  totalInvoices: row.totalInvoices,
  totalPaid: formatCurrency(row.totalPaid),
  totalPending: formatCurrency(row.totalPending),
});
