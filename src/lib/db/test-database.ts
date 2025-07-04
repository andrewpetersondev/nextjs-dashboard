// import "server-only";

import {
	drizzle,
	type NodePgClient,
	type NodePgDatabase,
} from "drizzle-orm/node-postgres";

console.log("test-database.ts ...");

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
	url = process.env.POSTGRES_URL_TESTDB;
	console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
	console.error("POSTGRES_URL_TESTDB is not set.");
	process.exit(1);
}

export const nodeEnvTestDb: NodePgDatabase & {
	$client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
