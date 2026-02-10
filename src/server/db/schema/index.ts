import { customers } from "./customers";
import { demoUserCounters } from "./demo-users";
import { invoices } from "./invoices";
import { revenues } from "./revenues";
import { users } from "./users";

// biome-ignore lint/performance/noBarrelFile: ok for now
export {
  customersRelations,
  demoUserCountersRelations,
  invoicesRelations,
  revenuesRelations,
} from "@/server/db/schema/relations";
export {
  type CustomerRow,
  customers,
  type NewCustomerRow,
} from "./customers";
export {
  type DemoUserCounterRow,
  demoUserCounters,
  type NewDemoUserCounterRow,
} from "./demo-users";
export {
  type InvoiceRow,
  invoices,
  type NewInvoiceRow,
  statusEnum,
} from "./invoices";
export {
  calculationSourceEnum,
  type NewRevenueRow,
  type RevenueRow,
  revenues,
} from "./revenues";
export {
  type AuthUserCredentialsRow,
  type NewUserRow,
  type UserRow,
  userRolePgEnum,
  users,
} from "./users";

// A single schema object that can be passed to drizzle()
// biome-ignore lint/nursery/useExplicitType: fix
export const schema = {
  customers,
  demoUserCounters,
  invoices,
  revenues,
  users,
};
