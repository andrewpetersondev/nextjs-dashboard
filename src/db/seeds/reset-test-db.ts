import { reset } from "drizzle-seed";
import * as schema from "@/src/db/schema";
import { testDB } from "@/src/db/test-database";

async function main(): Promise<void> {
	await reset(testDB, schema);
}

main().then((): void =>
	console.log("drizzle reset complete, tables remain, but values are gone"),
);
