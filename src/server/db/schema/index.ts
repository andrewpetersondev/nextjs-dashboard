import { customers } from "./customers";
import { demoUserCounters } from "./demo-users";
import { invoices } from "./invoices";
import { revenues } from "./revenues";
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
  type AuthUserCredentialsRow,
  type NewUserRow,
  roleEnum,
  type UserRow,
  users,
} from "./users";

// A single schema object that can be passed to drizzle()
export const schema = {
  customers,
  demoUserCounters,
  invoices,
  revenues,
  users,
};
