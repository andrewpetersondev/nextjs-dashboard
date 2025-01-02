// use drizzle's built-in seed generation

import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import {
  usersTable,
  customersTable,
  invoicesTable,
  revenueTable,
  peopleTable,
} from "@/src/db/schema";

async function seedUsers() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { usersTable }, { count: 10 });
}

seedUsers().then((r) => console.log(r));

async function seedCustomers() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { customersTable }, { count: 10 });
}

seedCustomers().then((r) => console.log(r));

async function seedInvoices() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { invoicesTable }, { count: 10 });
}

seedInvoices().then((r) => console.log(r));

async function seedRevenue() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { revenueTable }, { count: 10 });
}

seedRevenue().then((r) => console.log(r));

async function seedPeople() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { peopleTable }, { count: 10 });
}

seedPeople().then((r) => console.log(r));