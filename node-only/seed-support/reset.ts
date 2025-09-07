import { reset } from "drizzle-seed";
import { nodeDb } from "../cli/node-db";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { invoices } from "../schema/invoices";
import { revenues } from "../schema/revenues";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";

const schema = {
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};

export async function resetCypressDb(): Promise<void> {
  await reset(nodeDb, schema);
}
