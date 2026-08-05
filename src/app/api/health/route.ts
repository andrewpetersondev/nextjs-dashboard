import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAppDb } from "@/server/db/db.connection";
import { getDeployedCommitSha } from "@/shared/core/config/server/deployment-identity";
import { DATABASE_URL } from "@/shared/core/config/server/env-server";
import { getDatabaseEnv, isProd } from "@/shared/core/config/shared/env-shared";

/**
 * Non-secret database identity, surfaced only outside production.
 *
 * The e2e harness uses this to confirm a server is pointed at the test database
 * before running destructive specs — closing the "right port, wrong server" gap
 * where start-server-and-test accepts any 2xx response without checking which
 * DB is behind it. Never includes credentials, and is omitted entirely on the
 * public production endpoint. See the e2e port-reuse guard in BACKLOG.md.
 */
function nonProdDbIdentity():
	| { databaseEnv: string; databaseName: string }
	| Record<string, never> {
	try {
		if (isProd()) {
			return {};
		}
		const databaseName =
			new URL(DATABASE_URL).pathname.split("/").filter(Boolean).at(-1) ?? "";
		return { databaseEnv: getDatabaseEnv(), databaseName };
	} catch {
		return {};
	}
}

/**
 * Liveness/readiness probe, plus the deployment's own identity.
 *
 * Pings the database with a trivial query so the endpoint reflects real
 * connectivity, not just that the Node process is up. Returns 200 when the DB
 * answers and 503 when it does not — suitable for a load balancer, container
 * orchestrator (Docker `healthcheck`), or uptime monitor.
 *
 * Also reports `commit` (omitted off-platform), because healthy and *current*
 * are independent properties: when a build fails, the previous deployment keeps
 * serving and answers every liveness question correctly while running older
 * code. The commit is the only field here that can tell those two apart.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
	const timestamp = new Date().toISOString();
	const commit = getDeployedCommitSha();
	// Spread so the key is absent (not null) off-platform, letting a prober
	// distinguish "this build predates commit reporting" from "unknown build".
	const identity = commit ? { commit } : {};

	try {
		await getAppDb().execute(sql`select 1`);
		return NextResponse.json(
			{
				db: "up",
				status: "ok",
				timestamp,
				...identity,
				...nonProdDbIdentity(),
			},
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{ db: "down", status: "error", timestamp, ...identity },
			{ status: 503 },
		);
	}
}
