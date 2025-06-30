import "server-only";

import {
	drizzle,
	type NodePgClient,
	type NodePgDatabase,
} from "drizzle-orm/node-postgres";

console.log("dev-database.ts ...");

let url: string;

// biome-ignore lint/style/noProcessEnv: I need it.
if (process.env.POSTGRES_URL) {
	// biome-ignore lint/style/noProcessEnv: I need it.
	url = process.env.POSTGRES_URL;
} else {
	console.error("POSTGRES_URL is not set.");
	process.exit(1);
}

export const db: NodePgDatabase & {
	$client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });
