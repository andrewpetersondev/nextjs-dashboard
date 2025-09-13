import "server-only";

import { reset } from "drizzle-seed";
import { NextResponse } from "next/server";
import { getDB } from "@/server/db/connection";
import { schema } from "@/server/db/schema";

export async function GET() {
  try {
    await reset(getDB(), schema);
    return NextResponse.json({ action: "reset", ok: true });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { action: "reset", error: String(error), ok: false },
      { status: 500 },
    );
  }
}
