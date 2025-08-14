import bcryptjs from "bcryptjs";
import { sql } from "drizzle-orm";
import { seed } from "drizzle-seed";
import * as schema from "../schema";
import { nodeEnvTestDb } from "../test-database";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
}

// Periods for revenues (must be first day of month to satisfy checks/FKs). Should these be Date objects?
const periods: string[] = [
  "2024-01-01",
  "2024-02-01",
  "2024-03-01",
  "2024-04-01",
  "2024-05-01",
  "2024-06-01",
  "2024-07-01",
  "2024-08-01",
  "2024-09-01",
  "2024-10-01",
  "2024-11-01",
  "2024-12-01",
  "2025-01-01",
  "2025-02-01",
  "2025-03-01",
  "2025-04-01",
  "2025-05-01",
  "2025-06-01",
  "2025-07-01",
];

const roles = ["guest", "admin", "user"] as const;

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

async function isEmpty(): Promise<boolean> {
  // Fast emptiness check using EXISTS
  const checks = await Promise.all([
    nodeEnvTestDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.users} LIMIT 1) AS v`,
    ),
    nodeEnvTestDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.customers} LIMIT 1) AS v`,
    ),
    nodeEnvTestDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.invoices} LIMIT 1) AS v`,
    ),
    nodeEnvTestDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.revenues} LIMIT 1) AS v`,
    ),
    nodeEnvTestDb.execute(
      sql`SELECT EXISTS(SELECT 1 FROM ${schema.demoUserCounters} LIMIT 1) AS v`,
    ),
  ]);
  return checks.every((r: any) => r.rows?.[0]?.v === false);
}

async function truncateAll(): Promise<void> {
  // Safe in dev/test: resets serials and cascades to dependents
  await nodeEnvTestDb.execute(sql`TRUNCATE TABLE
    ${schema.sessions},
    ${schema.invoices},
    ${schema.customers},
    ${schema.revenues},
    ${schema.demoUserCounters},
    ${schema.users}
  RESTART IDENTITY CASCADE`);
}

async function main(): Promise<void> {
  const shouldReset = process.env.SEED_RESET === "true";

  if (shouldReset) {
    await truncateAll();
  } else {
    const empty = await isEmpty();
    if (!empty) {
      console.error(
        "Database is not empty. Set SEED_RESET=true to force reseed. Exiting...",
      );
      return;
    }
  }

  // Prepare users with hashed passwords
  const userSeed = [
    {
      email: "user@user.com",
      password: await hashPassword("UserPassword123!"),
      role: "user" as const,
      username: "user",
    },
    {
      email: "admin@admin.com",
      password: await hashPassword("AdminPassword123!"),
      role: "admin" as const,
      username: "admin",
    },
    {
      email: "guest@guest.com",
      password: await hashPassword("GuestPassword123!"),
      role: "guest" as const,
      username: "guest",
    },
  ];

  // 1) Seed revenues first (parents)
  await seed(nodeEnvTestDb, schema).refine((f) => ({
    revenues: {
      columns: {
        calculationSource: f.default({ defaultValue: "seed" }),
        invoiceCount: f.default({ defaultValue: 0 }),
        // I do not like how periods are set from a fixed array
        period: f.valuesFromArray({ isUnique: true, values: periods }),
        // Leave aggregates at zero and compute them after invoices
        totalAmount: f.default({ defaultValue: 0 }),
      },
      count: periods.length,
    },
  }));

  // 2) Seed customers (with invoices referencing existing revenues)
  // I do not like how seeding customers can create a customer with email, imageUrl, and names that are clearly not intended to belong together. (e.g., Amy Burns should have the email address amy@burns.com and the image url containing her name.
  await seed(nodeEnvTestDb, schema).refine((f) => ({
    customers: {
      columns: {
        email: f.valuesFromArray({ isUnique: true, values: customerEmails }),
        imageUrl: f.valuesFromArray({
          isUnique: true,
          values: customerImageUrls,
        }),
        name: f.valuesFromArray({ isUnique: true, values: customerFullNames }),
      },
      count: customerFullNames.length,
    },
  }));

  // 3) Seed invoices
  // Generate invoices that:
  // - choose a revenuePeriod from seeded revenues
  // - set date equal to that revenuePeriod (first of month) to satisfy the check constraint
  await seed(nodeEnvTestDb, schema).refine((f) => ({
    invoices: {
      columns: {
        // amounts in cents; bigint-compatible and non-negative
        // I do not like how the amount uses weights. I'd prefer a random distribution which also provides values for edge cases
        amount: f.weightedRandom([
          { value: f.default({ defaultValue: 100_000 }), weight: 5 / 15 },
          {
            value: f.int({ maxValue: 1_000_000, minValue: 10_000 }),
            weight: 10 / 15,
          },
        ]),
        // customerId will be auto-populated if we relate via with:, but since we’re seeding invoices standalone we assign a random customerId from existing rows.
        // What does the above comment mean?
        // f.ref() does not exist on the type. what is this trying to do and how do I make sure that the seeded invoices are properly generated to align with my schema file?
        customerId: f.ref(schema.customers.id),
        date: f.valuesFromArray({ values: periods }),
        // Pick a period and use it for both date and revenuePeriod to satisfy the FK + check
        revenuePeriod: f.valuesFromArray({ values: periods }),
        status: f.valuesFromArray({ values: ["pending", "paid"] }),
      },
      count: 70,
    },
  }));

  // 4) Seed demo user counters
  await seed(nodeEnvTestDb, schema).refine((f) => ({
    demoUserCounters: {
      columns: {
        count: f.int({ maxValue: 100, minValue: 1 }),
        role: f.valuesFromArray({ isUnique: true, values: [...roles] }),
      },
      count: roles.length,
    },
  }));

  // 5) Seed users
  await seed(nodeEnvTestDb, schema).refine((f) => ({
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
          values: userSeed.map((u) => u.role),
        }),
        username: f.valuesFromArray({
          isUnique: true,
          values: userSeed.map((u) => u.username),
        }),
      },
      count: userSeed.length,
    },
  }));

  // 6) Recompute revenue aggregates from invoices
  // totalAmount: sum of invoice amounts for that period
  // invoiceCount: number of invoices for that period
  await nodeEnvTestDb.execute(sql`
    UPDATE ${schema.revenues} r
    SET
      ${schema.revenues.totalAmount} = COALESCE(agg.total_amount, 0),
      ${schema.revenues.invoiceCount} = COALESCE(agg.invoice_count, 0),
      ${schema.revenues.updatedAt} = NOW()
    FROM (
      SELECT
        ${schema.invoices.revenuePeriod} AS period,
        SUM(${schema.invoices.amount}) AS total_amount,
        COUNT(*) AS invoice_count
      FROM ${schema.invoices}
      GROUP BY ${schema.invoices.revenuePeriod}
    ) AS agg
    WHERE r.${schema.revenues.period} = agg.period
  `);

  console.log("Database seeded successfully.");
}

main().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
