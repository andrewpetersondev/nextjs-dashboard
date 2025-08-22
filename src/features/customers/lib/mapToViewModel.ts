// src/features/customers/lib/mapToViewModel.ts

import type {
  CustomerField,
  FormattedCustomersTableRow,
} from "@/features/customers/types";
import type {
  CustomerSelectDbRow,
  CustomerTableDbRowRaw,
} from "@/server/customers/types";
import { formatCurrency } from "@/shared/utils/general";

export const toCustomerField = (row: CustomerSelectDbRow): CustomerField => ({
  id: row.id,
  name: row.name,
});

export const toFormattedCustomersTableRow = (
  row: CustomerTableDbRowRaw,
): FormattedCustomersTableRow => ({
  email: row.email,
  id: row.id,
  imageUrl: row.imageUrl,
  name: row.name,
  totalInvoices: row.totalInvoices,
  totalPaid: formatCurrency(row.totalPaid),
  totalPending: formatCurrency(row.totalPending),
});
