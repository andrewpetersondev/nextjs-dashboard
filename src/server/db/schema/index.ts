import { customers } from "./customers";
import { demoUserCounters } from "./demo-users";
import { invoices } from "./invoices";
import { revenues } from "./revenues";
import { sessions } from "./sessions";
import { users } from "./users";

// biome-ignore lint/performance/noBarrelFile: needed for drizzle schema
export {
  type CustomerRow,
  customers,
  customersRelations,
  type NewCustomerRow,
} from "./customers";
export {
  type DemoUserCounterRow,
  demoUserCounters,
  demoUserCountersRelations,
  type NewDemoUserCounterRow,
} from "./demo-users";
export {
  type InvoiceRow,
  invoices,
  invoicesRelations,
  type NewInvoiceRow,
  statusEnum,
} from "./invoices";
export {
  calculationSourceEnum,
  type NewRevenueRow,
  type RevenueRow,
  revenues,
  revenuesRelations,
} from "./revenues";
export {
  type NewSessionRow,
  type SessionRow,
  sessions,
  sessionsRelations,
} from "./sessions";
export {
  type NewUserRow,
  roleEnum,
  type UserRow,
  users,
  usersRelations,
} from "./users";

// A single schema object that can be passed to drizzle()
export const schema = {
  customers,
  demoUserCounters,
  invoices,
  revenues,
  sessions,
  users,
};
