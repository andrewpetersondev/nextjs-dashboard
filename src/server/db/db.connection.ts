import "server-only";
import type { schema as appSchema } from "@database/schema/schema.aggregate";
import {
	drizzle,
	type NodePgClient,
	type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "@/shared/core/config/server/env-server";

let appDbSingleton: AppDatabase | null = null;

/**
 * Strongly-typed application database bound to the shared schema.
 * Includes the underlying NodePgClient for advanced scenarios.
 */
export type AppDatabase = NodePgDatabase<typeof appSchema> & {
	readonly $client: NodePgClient;
};

/**
 * Returns the memoized application database instance.
 * Safe to call multiple times; always returns the same singleton.
 */
export function getAppDb(): AppDatabase {
	if (appDbSingleton) {
		return appDbSingleton;
	}

	appDbSingleton = drizzle({
		casing: "snake_case",
		connection: DATABASE_URL,
	}) satisfies AppDatabase;

	return appDbSingleton;
}
