import { InferSelectModel } from "drizzle-orm";
import { users, customers, invoices, revenue } from "@/src/db/schema";

// Raw table types (database-level)
export type User = InferSelectModel<typeof users>;
export type Customer = InferSelectModel<typeof customers>;
// export type Invoice = InferSelectModel<typeof invoices>;
export type Revenue = InferSelectModel<typeof revenue>;