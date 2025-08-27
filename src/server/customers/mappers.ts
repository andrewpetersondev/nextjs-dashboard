import "server-only";

import type {
  CustomerAggregatesServerDto,
  CustomerSelectServerDto,
} from "@/features/customers/types";
import type {
  CustomerAggregatesRowRaw,
  CustomerSelectRowRaw,
} from "@/server/customers/types";
import { toCustomerId } from "@/shared/brands/mappers";

/**
 * Maps a raw "select" projection row to a server DTO with branded ID.
 */
export function mapCustomerSelectRawToDto(
  row: CustomerSelectRowRaw,
): CustomerSelectServerDto {
  return {
    id: toCustomerId(row.id),
    name: row.name,
  };
}

/**
 * Maps a raw aggregated projection row to a normalized server DTO with branded ID.
 * - Normalizes nullable sums to 0.
 */
export function mapCustomerAggregatesRawToDto(
  row: CustomerAggregatesRowRaw,
): CustomerAggregatesServerDto {
  return {
    email: row.email,
    id: toCustomerId(row.id),
    imageUrl: row.imageUrl,
    name: row.name,
    totalInvoices: row.totalInvoices ?? 0,
    totalPaid: row.totalPaid ?? 0,
    totalPending: row.totalPending ?? 0,
  };
}
