import type {
  CustomerField,
  FormattedCustomersTableRow,
} from "@/features/customers/types";
import type {
  CustomerAggregatesServerDto,
  CustomerSelectServerDto,
  // biome-ignore lint/style/noRestrictedImports: <fix later>
} from "@/server/customers/types";
import { formatCurrency } from "@/shared/utils/general";

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
