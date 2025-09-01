import { reset } from "drizzle-seed";
import { customers } from "../../node-only/schema/customers";
import { demoUserCounters } from "../../node-only/schema/demo-users";
import { invoices } from "../../node-only/schema/invoices";
import { revenues } from "../../node-only/schema/revenues";
import { sessions } from "../../node-only/schema/sessions";
import { users } from "../../node-only/schema/users";
import { db } from "./config";

const schema = {
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};

export async function resetCypressDb(): Promise<void> {
  await reset(db, schema);
}
