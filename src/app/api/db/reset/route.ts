import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { reset } from "drizzle-seed";
import { NextResponse } from "next/server";
import { getAppDb } from "@/server/db/db.connection";
import { isTestDatabaseEnvironment } from "@/shared/core/config/shared/env-shared";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Test-only route that truncates every table (drizzle-seed `reset`).
 *
 * Cypress e2e calls this between specs against a server started with
 * `.env.test.local`. Outside the test database environment the route
 * answers 404 so a deployed instance never exposes a destructive endpoint.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
	if (!isTestDatabaseEnvironment()) {
		return new NextResponse(null, { status: 404 });
	}

	try {
		await reset(getAppDb(), schema);
		return NextResponse.json({ action: "reset", ok: true });
	} catch (error) {
		logger.error("Error resetting database", {
			error: Error.isError(error) ? error.message : "Unknown error",
			stack: Error.isError(error) ? error.stack : undefined,
		});
		return NextResponse.json(
			{ action: "reset", error: String(error), ok: false },
			{ status: 500 },
		);
	}
}
