import "server-only";
import { type RevenueRow, revenues } from "@database/schema";
import { eq } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowToEntity } from "@/modules/revenues/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import {
	makeAppError,
	makeUnexpectedError,
} from "@/shared/core/errors/core/factories/app-error.factory";
import type { Period } from "@/shared/primitives/period/period.brand";
import { toPeriod } from "@/shared/primitives/period/period.mappers";

/**
 * Finds a revenue record by period.
 * @param db - The database connection.
 * @param period - The period to search for.
 * @returns The revenue entity or null if not found.
 * @throws Error if period is invalid or mapping fails.
 */
export async function findRevenueByPeriodDal(
	db: AppDatabase,
	period: Period,
): Promise<RevenueEntity | null> {
	if (!period) {
		throw makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: "Period is required",
			metadata: {},
		});
	}

	const data: RevenueRow | undefined = await db
		.select()
		.from(revenues)
		.where(eq(revenues.period, toPeriod(period)))
		.limit(1)
		.then((rows) => rows[0]);

	if (!data) {
		return null;
	}

	const result: RevenueEntity = mapRevenueRowToEntity(data);
	if (!result) {
		throw makeUnexpectedError("", {
			message: "Failed to convert revenue record",
			overrideMetadata: { table: "revenues" },
		});
	}
	return result;
}
