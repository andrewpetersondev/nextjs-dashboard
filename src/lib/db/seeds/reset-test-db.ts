import { reset } from "drizzle-seed";
import * as schema from "@/src/lib/db/schema.ts";
import { testDB } from "@/src/lib/db/test-database.ts";

async function main(): Promise<void> {
	await reset(testDB, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
	.then((): void => {
		console.log("drizzle reset complete, tables remain, but values are gone");
	})
	.catch((error) => {
		console.error("Error resetting test dB:", error);
	});
