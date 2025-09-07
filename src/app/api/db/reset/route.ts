import "server-only";

import { reset } from "drizzle-seed";
import { NextResponse } from "next/server";
import { getDB } from "@/server/db/connection";
import { customers } from "../../../../../node-only/schema/customers";
import { demoUserCounters } from "../../../../../node-only/schema/demo-users";
import { invoices } from "../../../../../node-only/schema/invoices";
import { revenues } from "../../../../../node-only/schema/revenues";
import { sessions } from "../../../../../node-only/schema/sessions";
import { users } from "../../../../../node-only/schema/users";

const schema = {
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};

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
