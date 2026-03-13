import "server-only";
import { type RevenueRow, revenues } from "@database/schema/revenues";
import { eq } from "drizzle-orm";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueId } from "@/modules/revenues/domain/types/revenue-id.brand";
import { mapRevenueRowToEntity } from "@/modules/revenues/infrastructure/mappers/revenue.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import {
	makeAppError,
	makeUnexpectedError,
} from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Reads a revenue record by ID.
 * @param db - The database connection.
 * @param id - The revenue ID.
 * @returns The revenue entity.
 * @throws Error if ID is invalid or record not found.
 */
export async function readRevenueDal(
	db: AppDatabase,
	id: RevenueId,
): Promise<RevenueEntity> {
	if (!id) {
		throw makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: "Revenue ID is required",
			metadata: {},
		});
	}

	const data: RevenueRow | undefined = await db
		.select()
		.from(revenues)
		.where(eq(revenues.id, id))
		.limit(1)
		.then((rows) => rows[0]);

	if (!data) {
		throw makeUnexpectedError("", {
			message: "Revenue record not found",
			overrideMetadata: {},
		});
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
