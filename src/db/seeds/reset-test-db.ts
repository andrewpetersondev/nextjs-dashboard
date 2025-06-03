import * as schema from "@/src/db/schema";
import { testDB } from "@/src/db/test-database";
import { reset } from "drizzle-seed";

async function main() {
	await reset(testDB, schema);
}

main().then(() =>
	console.log("drizzle reset complete, tables remain, but values are gone"),
);
