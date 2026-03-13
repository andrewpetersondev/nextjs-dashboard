import { DATABASE_URL } from "@cypress/node/config/cypress-env";
import {
	drizzle,
	type NodePgClient,
	type NodePgDatabase,
} from "drizzle-orm/node-postgres";

let dbSingleton:
	| (NodePgDatabase & { readonly $client: NodePgClient })
	| undefined;

function createNodeDb(connectionString: string) {
	if (!connectionString) {
		throw new Error("createNodeDb: empty connection string");
	}

	return drizzle({
		casing: "snake_case",
		connection: connectionString,
	}) as NodePgDatabase & { readonly $client: NodePgClient };
}

function getNodeDb() {
	if (!DATABASE_URL) {
		throw new Error("DATABASE_URL is not set.");
	}

	if (!dbSingleton) {
		dbSingleton = createNodeDb(DATABASE_URL);
	}

	return dbSingleton;
}

export const nodeDb = getNodeDb();
