import { reset } from "drizzle-seed";
import { db } from "@/src/lib/db/dev-database";
import * as schema from "@/src/lib/db/schema";

async function main(): Promise<void> {
	await reset(db, schema);
}

// Fix: Handle floating promise with .catch for error logging
main()
	.then((): void => {
		console.log("drizzle reset complete, tables remain, but values are gone");
	})
	.catch((error) => {
		console.error("Error resetting DB:", error);
	});
