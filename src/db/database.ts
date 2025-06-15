import "server-only";

import {
	type NodePgClient,
	type NodePgDatabase,
	drizzle,
} from "drizzle-orm/node-postgres";

console.log("database.ts ...");

let url: string;

if (process.env.POSTGRES_URL) {
	url = process.env.POSTGRES_URL;
} else {
	console.error("POSTGRES_URL is not set.");
	process.exit(1);
}

export const db: NodePgDatabase<Record<string, never>> & {
	$client: NodePgClient;
} = drizzle({ connection: url, casing: "snake_case" });
