import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAppDb } from "@/server/db/db.connection";
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
 * Liveness/readiness probe.
 *
 * Pings the database with a trivial query so the endpoint reflects real
 * connectivity, not just that the Node process is up. Returns 200 when the DB
 * answers and 503 when it does not — suitable for a load balancer, container
 * orchestrator (Docker `healthcheck`), or uptime monitor.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
	const timestamp = new Date().toISOString();
	try {
		await getAppDb().execute(sql`select 1`);
		return NextResponse.json(
			{ db: "up", status: "ok", timestamp, ...nonProdDbIdentity() },
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{ db: "down", status: "error", timestamp },
			{ status: 503 },
		);
	}
}
