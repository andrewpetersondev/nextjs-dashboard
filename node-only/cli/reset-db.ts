import { reset } from "drizzle-seed";
import { accounts } from "../schema/accounts";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { invoices } from "../schema/invoices";
import { revenues } from "../schema/revenues";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";
import { nodeDb } from "./node-db";

console.log("reset-db.ts ...");

const schema = {
  accounts,
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};

export async function resetDatabase(): Promise<void> {
  await reset(nodeDb, schema);
}
