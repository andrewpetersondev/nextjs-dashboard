import * as schema from "@/src/db/schema";
import { reset } from "drizzle-seed";
import { testDB } from "@/src/db/test-database";

async function main() {
    await reset(testDB, schema);
}

main().then(() =>
    console.log("drizzle reset complete, tables remain, but values are gone"),
);
