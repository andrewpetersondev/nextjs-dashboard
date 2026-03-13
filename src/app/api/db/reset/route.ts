import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { reset } from "drizzle-seed";
import { NextResponse } from "next/server";
import { getAppDb } from "@/server/db/db.connection";

// biome-ignore lint/nursery/useExplicitType: <fix later>
export async function GET() {
	try {
		await reset(getAppDb(), schema);
		return NextResponse.json({ action: "reset", ok: true });
	} catch (error) {
		console.error("Error resetting database:", error);
		return NextResponse.json(
			{ action: "reset", error: String(error), ok: false },
			{ status: 500 },
		);
	}
}
