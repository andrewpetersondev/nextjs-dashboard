import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAppDb } from "@/server/db/db.connection";

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
	try {
		await getAppDb().execute(sql`select 1`);
		return NextResponse.json(
			{ db: "up", status: "ok", timestamp: new Date().toISOString() },
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{ db: "down", status: "error", timestamp: new Date().toISOString() },
			{ status: 503 },
		);
	}
}
