import "server-only";
import type { RevenueRow } from "@database/schema/revenues";
import { schema } from "@database/schema/schema.aggregate";
import { and, desc, gte, lte } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { mapRevenueRowsToEntities } from "@/modules/revenues/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import {
	makeAppError,
	makeUnexpectedError,
} from "@/shared/core/errors/core/factories/app-error.factory";
import type { Period } from "@/shared/primitives/period/period.brand";
import { toPeriod } from "@/shared/primitives/period/period.mappers";

/**
 * Finds revenue records within a date range.
 * @param db - The database connection.
 * @param endPeriod - The end period.
 * @param startPeriod - The start period.
 * @returns Array of revenue entities.
 * @throws Error if periods are invalid or retrieval fails.
 */
export async function findRevenuesByDateRangeDal(
	db: AppDatabase,
	startPeriod: Period,
	endPeriod: Period,
): Promise<RevenueEntity[]> {
	if (!(startPeriod && endPeriod)) {
		throw makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: "Start and end periods are required",
			metadata: {},
		});
	}

	const revenueRows = (await db
		.select()
		.from(schema.revenues)
		.where(
			and(
				gte(schema.revenues.period, toPeriod(startPeriod)),
				lte(schema.revenues.period, toPeriod(endPeriod)),
			),
		)
		.orderBy(desc(schema.revenues.period))) as RevenueRow[];

	if (!revenueRows) {
		throw makeUnexpectedError("", {
			message: "Failed to retrieve revenue records",
			overrideMetadata: { table: "revenues" },
		});
	}

	return mapRevenueRowsToEntities(revenueRows);
}
