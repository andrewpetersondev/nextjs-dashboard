import "server-only";
import type { CustomerRow } from "@database/schema/customers";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";

import type {
	CustomerAggregatesRowRaw,
	CustomerAggregatesServerDto,
	CustomerEntity,
	CustomerSelectRowRaw,
	CustomerSelectServerDto,
} from "@/modules/customers/domain/types";

/**
 * The columns a `CustomerEntity` is built from.
 *
 * Declared as a `Pick` rather than the full `CustomerRow` so both callers fit:
 * write DALs hand over a complete `.returning()` row, while `readCustomerDal`
 * selects only these four columns — deliberately leaving `sensitiveData` behind
 * at the query, not at the mapper.
 */
type CustomerRowForEntity = Pick<
	CustomerRow,
	"email" | "id" | "imageUrl" | "name"
>;

/**
 * Maps a customer row to the branded domain entity.
 */
export function mapCustomerRowToEntity(
	row: CustomerRowForEntity,
): CustomerEntity {
	return {
		email: row.email,
		id: toCustomerId(row.id),
		imageUrl: row.imageUrl,
		name: row.name,
	};
}

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
		totalInvoices: row.totalInvoices,
		totalPaid: row.totalPaid ?? 0,
		totalPending: row.totalPending ?? 0,
	};
}
