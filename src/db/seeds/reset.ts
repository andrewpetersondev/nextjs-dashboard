import { db } from "@/src/db/database";
import * as schema from "@/src/db/schema";
import { reset } from "drizzle-seed";

async function main() {
	await reset(db, schema);
}

main().then(() =>
	console.log("drizzle reset complete, tables remain, but values are gone"),
);
