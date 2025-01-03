// use drizzle's built-in seed generation

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { users, customers, invoices, revenue, people } from "@/src/db/schema";
import { Pool } from "pg";

// async function seedUsers() {
//   const pool = new Pool({
//     host: "localhost",
//     user: "user",
//     database: "postgres",
//     connectionString: process.env.DATABASE_URL,
//   });
//   const db = drizzle({ client: pool });
//   await seed(db, { users }, { count: 10 });
// }
// seedUsers().then((r) => console.log(r));

// async function seedCustomers() {
// const pool = new Pool({
//   host: "localhost",
//   user: "user",
//   database: "postgres",
//   connectionString: process.env.DATABASE_URL,
// });
// const db = drizzle({ client: pool });
//   await seed(db, { customers }, { count: 10 });
// }

// seedCustomers().then((r) => console.log(r));

// async function seedInvoices() {
// const pool = new Pool({
//   host: "localhost",
//   user: "user",
//   database: "postgres",
//   connectionString: process.env.DATABASE_URL,
// });
// const db = drizzle({ client: pool });
//   await seed(db, { invoices }, { count: 10 });
// }

// seedInvoices().then((r) => console.log(r));

// async function seedRevenue() {
// const pool = new Pool({
//   host: "localhost",
//   user: "user",
//   database: "postgres",
//   connectionString: process.env.DATABASE_URL,
// });
// const db = drizzle({ client: pool });
//   await seed(db, { revenue }, { count: 10 });
// }

// seedRevenue().then((r) => console.log(r));

async function seedPeople() {
  const pool = new Pool({
    host: "localhost",
    user: "user",
    database: "postgres",
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle({ client: pool });
  await seed(db, { people }, { count: 10 });
}

seedPeople().then((r) => console.log(r));