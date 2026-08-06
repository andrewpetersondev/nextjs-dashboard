import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { invoices } from "@database/schema/invoices";
import { users } from "@database/schema/users";
import { nodeDb } from "@devtools/shared/db/node-db";
import { firstRow } from "@devtools/shared/db/pg-result.utils";
import { sql } from "drizzle-orm";

/**
 * Check if all relevant tables are empty.
 */
async function isEmpty(): Promise<boolean> {
	const checks = await Promise.all([
		nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${users}) AS v`),
		nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${customers}) AS v`),
		nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${invoices}) AS v`),
		nodeDb.execute(sql`SELECT EXISTS(SELECT 1 FROM ${demoUserCounters}) AS v`),
	]);
	return checks.every((r) => firstRow<{ v: boolean }>(r)?.v === false);
}

/**
 * Abort seeding unless every seeded table is empty.
 *
 * Throwing (rather than returning a boolean) is deliberate, mirroring
 * `assertDestructiveDbTaskAllowed`: devtools CLIs use `runCli`'s catch as
 * their error boundary, so a refused seed must exit non-zero instead of
 * resolving into "Database seeded successfully." There is intentionally no
 * force-reseed escape hatch here — reset explicitly, then seed.
 */
export async function assertDatabaseEmpty(): Promise<void> {
	if (await isEmpty()) {
		return;
	}
	throw new Error(
		"Refusing to run db:seed: database is not empty. " +
			"Reset it first with the matching env pair, e.g. `pnpm db:reset:dev && pnpm db:seed:dev`.",
	);
}
