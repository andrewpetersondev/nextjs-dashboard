/**
 * @file best-seed-dev-db.ts
 * @description
 * Seeds the development database with initial data using Drizzle Seed.
 *
 * - Intended for CLI tooling and Cypress only.
 * - Do **not** import or use in application runtime code.
 * - Do **not** import "server-only" code.
 * - This file MAY need to include file extensions like .ts for compatibility with the CLI tools and Cypress.
 * - This file MAY need to use RELATIVE IMPORTS for compatibility with the CLI tools and Cypress.
 * - Uses the dev database connection from `dev-database.ts`.
 * - All credentials are managed via environment variables and Hashicorp Vault.
 *
 * @see https://orm.drizzle.team/docs/seed
 */

// biome-ignore-all lint/style/noNonNullAssertion: <the data exists>

import bcryptjs from "bcryptjs";
import { seed } from "drizzle-seed";
import { nodeEnvDb } from "../dev-database";
import * as schema from "../schema";

const SALT_ROUNDS: number = 10;

const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt: string = await bcryptjs.genSalt(SALT_ROUNDS);
    return await bcryptjs.hash(password, salt);
  } catch (error: unknown) {
    console.error("Error while hashing password:", error);
    throw error;
  }
};

const customerFullNames: string[] = [
  "Evil Rabbits",
  "Delba de Oliveira",
  "Lee Robinson",
  "Michael Novotny",
  "Amy Burns",
  "Balazs Orban",
];

const customerEmails: string[] = [
  "evil@rabbit.com",
  "delba@oliveira.com",
  "lee@robinson.com",
  "michael@novotny.com",
  "amy@burns.com",
  "balazs@orban.com",
];

const customerImageUrls: string[] = [
  "/customers/evil-rabbit.png",
  "/customers/delba-de-oliveira.png",
  "/customers/lee-robinson.png",
  "/customers/michael-novotny.png",
  "/customers/amy-burns.png",
  "/customers/balazs-orban.png",
];

const months: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const roles = ["guest", "admin", "user"] as const;

interface User {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "guest";
}

const userSeed: User[] = [
  {
    email: "user@user.com",
    password: await hashPassword("UserPassword123!"),
    role: "user",
    username: "user",
  },
  {
    email: "admin@admin.com",
    password: await hashPassword("AdminPassword123!"),
    role: "admin",
    username: "admin",
  },
  {
    email: "guest@guest.com",
    password: await hashPassword("GuestPassword123!"),
    role: "guest",
    username: "guest",
  },
];

async function main(): Promise<void> {
  // Check if the database is empty

  const { rows: userCount } = (await nodeEnvDb.execute(
    "SELECT COUNT(*) FROM users",
  )) as { rows: { count: number }[] };

  const { rows: customerCount } = (await nodeEnvDb.execute(
    "SELECT COUNT(*) FROM customers",
  )) as { rows: { count: number }[] };

  const { rows: invoiceCount } = (await nodeEnvDb.execute(
    "SELECT COUNT(*) FROM invoices",
  )) as { rows: { count: number }[] };

  const { rows: revenueCount } = (await nodeEnvDb.execute(
    "SELECT COUNT(*) FROM revenues",
  )) as { rows: { count: number }[] };

  const { rows: demoUserCount } = (await nodeEnvDb.execute(
    "SELECT COUNT(*) FROM demo_user_counters",
  )) as { rows: { count: number }[] };

  if (
    userCount[0]!.count > 0 ||
    customerCount[0]!.count > 0 ||
    invoiceCount[0]!.count > 0 ||
    revenueCount[0]!.count > 0 ||
    demoUserCount[0]!.count > 0
  ) {
    console.error("Database is not empty. Exiting...");
    return;
  }

  await seed(nodeEnvDb, schema).refine((f) => ({
    customers: {
      columns: {
        email: f.valuesFromArray({ isUnique: true, values: customerEmails }),
        imageUrl: f.valuesFromArray({
          isUnique: true,
          values: customerImageUrls,
        }),
        name: f.valuesFromArray({ isUnique: true, values: customerFullNames }),
      },
      count: 6,
      with: {
        invoices: [
          { count: [1, 2, 3], weight: 0.6 },
          { count: [4, 5], weight: 0.3 },
          { count: [6, 7, 8], weight: 0.1 },
        ],
      },
    },
    demoUserCounters: {
      columns: {
        count: f.intPrimaryKey({ maxValue: 100, minValue: 1 }),
        role: f.valuesFromArray({ isUnique: true, values: [...roles] }),
      },
      count: 3,
    },
    invoices: {
      columns: {
        amount: f.weightedRandom([
          {
            value: f.default({ defaultValue: 1000 }), // For the first record
            weight: 1 / 15,
          },
          {
            value: f.int({ maxValue: 10000, minValue: 100 }), // For remaining records
            weight: 14 / 15,
          },
        ]),
        date: f.date({ maxDate: "2025-01-01", minDate: "2024-01-01" }),
        status: f.valuesFromArray({ values: ["pending", "paid"] }),
      },
      count: 15,
    },
    revenues: {
      columns: {
        month: f.valuesFromArray({ isUnique: true, values: months }),
        revenue: f.int({ maxValue: 10000, minValue: 100 }),
      },
      count: 12,
    },
    users: {
      columns: {
        email: f.valuesFromArray({
          isUnique: true,
          values: userSeed.map((u) => u.email),
        }),
        password: f.valuesFromArray({
          isUnique: true,
          values: userSeed.map((u) => u.password),
        }),
        role: f.valuesFromArray({
          isUnique: true,
          values: userSeed.map((u: User) => u.role),
        }),
        username: f.valuesFromArray({
          isUnique: true,
          values: userSeed.map((u) => u.username),
        }),
      },
      count: 3,
    },
  }));
}

main().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
