import "server-only";

import { NextResponse } from "next/server";
import { databaseSeed } from "../../../../../devtools/cli/seed-db";

// biome-ignore lint/nursery/useExplicitType: <fix later>
export async function GET() {
  try {
    await databaseSeed();
    return NextResponse.json({ action: "seed", ok: true });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { action: "seed", error: String(error), ok: false },
      { status: 500 },
    );
  }
}
