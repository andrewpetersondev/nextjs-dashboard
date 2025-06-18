import { reset } from "drizzle-seed";
import { db } from "@/src/db/dev-database";
import * as schema from "@/src/db/schema";

async function main(): Promise<void> {
	await reset(db, schema);
}

main().then((): void =>
	console.log("drizzle reset complete, tables remain, but values are gone"),
);
