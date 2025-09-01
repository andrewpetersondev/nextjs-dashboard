import { reset } from "drizzle-seed";
import { customers } from "../schema/customers";
import { demoUserCounters } from "../schema/demo-users";
import { invoices } from "../schema/invoices";
import { revenues } from "../schema/revenues";
import { sessions } from "../schema/sessions";
import { users } from "../schema/users";
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
