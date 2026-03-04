import "server-only";

import type {
	RevenueCreateEntity,
	RevenueEntity,
	RevenueUpdatable,
} from "@/modules/revenues/domain/entities/revenue.entity";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import type { Period } from "@/shared/primitives/period/period.brand";
import { toPeriod } from "@/shared/primitives/period/period.mappers";
import { upsertRevenueDal } from "./upsert-revenue.dal";

/**
 * Upserts a revenue record by period.
 * @param db - The database connection.
 * @param period - The period.
 * @param revenue - The updatable fields.
 * @returns The upserted revenue entity.
 * @throws Error if inputs are invalid.
 */
export async function upsertRevenueByPeriod(
	db: AppDatabase,
	period: Period,
	revenue: RevenueUpdatable,
): Promise<RevenueEntity> {
	if (!period) {
		throw makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: "Period is required",
			metadata: {},
		});
	}
	if (!revenue) {
		throw makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: "Revenue data is required",
			metadata: {},
		});
	}

	const now = new Date();
	const payload: RevenueCreateEntity = {
		calculationSource: revenue.calculationSource,
		createdAt: now,
		invoiceCount: revenue.invoiceCount,
		period: toPeriod(period),
		totalAmount: revenue.totalAmount,
		totalPaidAmount: revenue.totalPaidAmount,
		totalPendingAmount: revenue.totalPendingAmount,
		updatedAt: now,
	};

	return await upsertRevenueDal(db, payload);
}
