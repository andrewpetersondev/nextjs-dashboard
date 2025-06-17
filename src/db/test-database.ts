// import "server-only";

import {
	type NodePgClient,
	type NodePgDatabase,
	drizzle,
} from "drizzle-orm/node-postgres";

console.log("test-dev-database.ts ...");

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
	url = process.env.POSTGRES_URL_TESTDB;
	console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
	console.error("POSTGRES_URL_TESTDB is not set.");
	process.exit(1);
}

export const testDB: NodePgDatabase & {
	$client: NodePgClient;
} = drizzle({ connection: url, casing: "snake_case" });
