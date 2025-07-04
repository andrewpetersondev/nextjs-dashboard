import { reset } from "drizzle-seed";
import { nodeEnvDb } from "@/src/lib/db/dev-database.ts";
import * as schema from "@/src/lib/db/schema.ts";

async function main(): Promise<void> {
	await reset(nodeEnvDb, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
	.then((): void => {
		console.log("drizzle reset complete, tables remain, but values are gone");
	})
	.catch((error) => {
		console.error("Error resetting Db:", error);
	});
