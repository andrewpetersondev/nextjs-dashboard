// Consolidated re-exports and a shared schema object for Drizzle usage

import { accounts } from "./accounts";
import { customers } from "./customers";
import { demoUserCounters } from "./demo-users";
import { invoices } from "./invoices";
import { revenues } from "./revenues";
import { sessions } from "./sessions";
import { users } from "./users";

// biome-ignore lint/performance/noBarrelFile: <only used for resetting database>
export { accounts } from "./accounts";

// Optionally re-export common row types for convenience
export type {
  CustomerRow,
  NewCustomerRow,
} from "./customers";
export { customers, customersRelations } from "./customers";
export type {
  DemoUserCounterRow,
  NewDemoUserCounterRow,
} from "./demo-users";
export { demoUserCounters, demoUserCountersRelations } from "./demo-users";
export type { InvoiceRow, NewInvoiceRow } from "./invoices";
export { invoices, invoicesRelations, statusEnum } from "./invoices";
export type { NewRevenueRow, RevenueRow } from "./revenues";
export { calculationSourceEnum, revenues, revenuesRelations } from "./revenues";
export type { NewSessionRow, SessionRow } from "./sessions";
export { sessions, sessionsRelations } from "./sessions";
export type { NewUserRow, UserRow } from "./users";
export { roleEnum, users, usersRelations } from "./users";

// A single schema object that can be passed to drizzle()
export const schema = {
  // Keep this list in sync with the exports above
  accounts,
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};
