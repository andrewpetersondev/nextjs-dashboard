import "server-only";

import { NextResponse } from "next/server";
import { devSeed } from "../../../../../node-only/cli/seed-dev-db";

export async function GET() {
  try {
    await devSeed();
    return NextResponse.json({ action: "seed", ok: true });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { action: "seed", error: String(error), ok: false },
      { status: 500 },
    );
  }
}
