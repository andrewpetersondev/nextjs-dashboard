/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */
/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: <temp> */
/** biome-ignore-all lint/performance/noNamespaceImport: <temp> */
/** biome-ignore-all lint/correctness/useImportExtensions: <temp> */

import bcryptjs from "bcryptjs";
import { sql } from "drizzle-orm";
import {
  drizzle,
  type NodePgClient,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import * as schema from "@/server/db/schema";
import type { Period } from "@/shared/brands/domain-brands";

/**
 * @file seeds/seed-test-db.ts
 * Seed script for initializing the test database with realistic sample data.
 *
 * - Target database: test_db (via POSTGRES_URL_TESTDB)
 * - Entry point: run directly with ts-node
 * - Idempotency: refuses to seed if data exists unless SEED_RESET=true
 *
 * Quick start:
 *   POSTGRES_URL_TESTDB=postgres://... pnpm ts-node src/db/seeds/seed-test-db.ts
 *   SEED_RESET=true pnpm ts-node src/db/seeds/seed-test-db.ts # force re-seed (TRUNCATE)
 */

console.log("db-test.ts ...");

let url: string;

if (process.env.POSTGRES_URL_TESTDB) {
  url = process.env.POSTGRES_URL_TESTDB;
  console.log("Using POSTGRES_URL_TESTDB:", url);
} else {
  console.error("POSTGRES_URL_TESTDB is not set.");
  process.exit(1);
}

const nodeEnvTestDb: NodePgDatabase & {
  $client: NodePgClient;
} = drizzle({ casing: "snake_case", connection: url });

/**
 * Configuration constants for seeding operations.
 * Extracted to improve maintainability and testability.
 */
const SEED_CONFIG = {
  DEMO_COUNTER_MAX: 100,
  /** Demo user counters range (inclusive) */
  DEMO_COUNTER_MIN: 1,
  /** The first day of any month (1-based) */
  FIRST_DAY_OF_MONTH: 1,
  GENERATE_MONTHLY_PERIODS_COUNT: 19,
  /** Number of invoices to generate */
  INVOICE_COUNT: 70,
  /** Threshold to decide between regular and large invoice amount generation */
  INVOICE_REGULAR_THRESHOLD: 0.9,
  /** Probability to generate "pending" invoice status */
  INVOICE_STATUS_PENDING_PROBABILITY: 0.5,
  /** Threshold for large amounts in cents */
  LARGE_AMOUNT_THRESHOLD: 1_500_001,
  /** Maximum amount for regular invoices in cents ($15,000) */
  MAX_AMOUNT_CENTS: 1_500_000,
  /** Maximum amount for large invoices in cents ($50,000) */
  MAX_LARGE_AMOUNT_CENTS: 5_000_000,
  /** Minimum amount for regular invoices in cents ($5.00) */
  MIN_AMOUNT_CENTS: 500,
  /** Probability of generating exactly MIN_AMOUNT_CENTS (in addition to zero + single-cent probabilities) */
  MIN_AMOUNT_PROBABILITY: 0.1,
  /** Minimum valid month number */
  MIN_MONTH: 1,
  MONTHS_IN_YEAR: 12,
  /** Number of salt rounds for password hashing */
  SALT_ROUNDS: 10,
  /** A single cent amount for explicit edge cases */
  SINGLE_CENT_AMOUNT: 1,
  /** Probability of generating single-cent amount (in addition to ZERO_AMOUNT_PROBABILITY) */
  SINGLE_CENT_PROBABILITY: 0.05,
  /** Probability of generating zero amounts for edge case testing */
  ZERO_AMOUNT_PROBABILITY: 0.05,
} as const;

/**
 * Validates that a period string represents the first day of a month.
 * Ensures compliance with database check constraints.
 *
 * @param period - Date string in YYYY-MM-DD format
 * @throws {Error} When period is not the first day of the month
 */
function validatePeriod(period: string): void {
  const date = new Date(`${period}T00:00:00.000Z`);
  if (date.getUTCDate() !== SEED_CONFIG.FIRST_DAY_OF_MONTH) {
    throw new Error(`Generated period ${period} is not first day of month`);
  }
}

/**
 * Hashes a password using bcrypt with configured salt rounds.
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(SEED_CONFIG.SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
}

/**
 * Generate first-of-month periods as YYYY-MM-DD strings.
 */
function generateMonthlyPeriods(start: string, months: number): string[] {
  if (!start) {
    throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
  }
  if (!months || months < 0) {
    throw new Error(
      `Invalid months count: ${months}. Must be a positive integer.`,
    );
  }
  const [yearStr, monthStr] = start.split("-");
  if (!yearStr || !monthStr) {
    throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
  }
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (Number.isNaN(year) || Number.isNaN(month)) {
    throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
  }

  const out: string[] = [];
  for (let i = 0; i < months; i++) {
    const currentYear =
      year + Math.floor((month - 1 + i) / SEED_CONFIG.MONTHS_IN_YEAR);
    const currentMonth = ((month - 1 + i) % SEED_CONFIG.MONTHS_IN_YEAR) + 1;
    const d = new Date(
      Date.UTC(currentYear, currentMonth - 1, SEED_CONFIG.FIRST_DAY_OF_MONTH),
    );
    const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
    out.push(iso);
  }
  return out;
}

/**
 * Predefined periods for revenue table seeding.
 * Covers 19 months starting from 2024-01-01.
 */
const periods = generateMonthlyPeriods(
  "2024-01-01",
  SEED_CONFIG.GENERATE_MONTHLY_PERIODS_COUNT,
);

// Convert to UTC Date objects for Drizzle DATE columns
const periodDates = periods.map((p) => new Date(`${p}T00:00:00.000Z`));

/**
 * Available user roles for demo user counters.
 */
const roles = ["guest", "admin", "user"] as const;

/**
 * Predefined customer data with aligned attributes.
 */
const customersData: Array<{ name: string; email: string; imageUrl: string }> =
  [
    {
      email: "evil@rabbit.com",
      imageUrl: "/customers/evil-rabbit.png",
      name: "Evil Rabbits",
    },
    {
      email: "delba@oliveira.com",
      imageUrl: "/customers/delba-de-oliveira.png",
      name: "Delba de Oliveira",
    },
    {
      email: "lee@robinson.com",
      imageUrl: "/customers/lee-robinson.png",
      name: "Lee Robinson",
    },
    {
      email: "michael@novotny.com",
      imageUrl: "/customers/michael-novotny.png",
      name: "Michael Novotny",
    },
    {
      email: "amy@burns.com",
      imageUrl: "/customers/amy-burns.png",
      name: "Amy Burns",
    },
    {
      email: "balazs@orban.com",
      imageUrl: "/customers/balazs-orban.png",
      name: "Balazs Orban",
    },
  ];

/**
 * Checks if all main tables are empty using efficient EXISTS queries.
 */
async function isEmpty(): Promise<boolean> {
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
  return checks.every((r) => r.rows?.[0]?.v === false);
}

/**
 * Truncates all tables and resets identity sequences.
 */
async function truncateAll(): Promise<void> {
  await nodeEnvTestDb.execute(sql`TRUNCATE TABLE
    ${schema.sessions},
    ${schema.invoices},
    ${schema.customers},
    ${schema.revenues},
    ${schema.demoUserCounters},
    ${schema.users}
    RESTART IDENTITY CASCADE`);
}

/**
 * Generates realistic invoice amounts (in cents).
 */
function generateInvoiceAmount(): number {
  const r = Math.random();
  if (r < SEED_CONFIG.ZERO_AMOUNT_PROBABILITY) {
    return 0;
  }
  if (
    r <
    SEED_CONFIG.ZERO_AMOUNT_PROBABILITY + SEED_CONFIG.SINGLE_CENT_PROBABILITY
  ) {
    return SEED_CONFIG.SINGLE_CENT_AMOUNT;
  }
  if (
    r <
    SEED_CONFIG.ZERO_AMOUNT_PROBABILITY +
      SEED_CONFIG.SINGLE_CENT_PROBABILITY +
      SEED_CONFIG.MIN_AMOUNT_PROBABILITY
  ) {
    return SEED_CONFIG.MIN_AMOUNT_CENTS;
  }

  if (r < SEED_CONFIG.INVOICE_REGULAR_THRESHOLD) {
    return (
      Math.floor(
        Math.random() *
          (SEED_CONFIG.MAX_AMOUNT_CENTS - SEED_CONFIG.MIN_AMOUNT_CENTS + 1),
      ) + SEED_CONFIG.MIN_AMOUNT_CENTS
    );
  }
  return (
    Math.floor(
      Math.random() *
        (SEED_CONFIG.MAX_LARGE_AMOUNT_CENTS -
          SEED_CONFIG.LARGE_AMOUNT_THRESHOLD +
          1),
    ) + SEED_CONFIG.LARGE_AMOUNT_THRESHOLD
  );
}

/**
 * Randomly selects an invoice status.
 */
function randomInvoiceStatus(): "pending" | "paid" {
  return Math.random() < SEED_CONFIG.INVOICE_STATUS_PENDING_PROBABILITY
    ? "pending"
    : "paid";
}

/**
 * Main seeding function.
 */

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

  await nodeEnvTestDb.transaction(async (tx) => {
    // 1) Seed revenues with Dates directly (no valuesFromArray)
    await tx.insert(schema.revenues).values(
      periodDates.map((periodDate) => ({
        calculationSource: "seed" as const,
        invoiceCount: 0,
        period: periodDate as Period, // Cast to branded Period type
        totalAmount: 0,
      })),
    );

    // 2) Seed customers in a single batch
    await tx.insert(schema.customers).values(
      customersData.map((c) => ({
        email: c.email,
        imageUrl: c.imageUrl,
        name: c.name,
      })),
    );

    // 3) Seed invoices using Date objects for date/revenuePeriod
    const existingCustomers = await tx
      .select({ id: schema.customers.id })
      .from(schema.customers);

    if (existingCustomers.length === 0) {
      throw new Error("No customers found after seeding customers.");
    }

    const invoiceRows: (typeof schema.invoices.$inferInsert)[] = [];

    /**
     * Generates invoice records by iterating INVOICE_COUNT times.
     * For each iteration:
     * - Randomly selects a customer from existing customers
     * - Randomly selects a period from predefined periods
     * - Generates a random date within that month for the invoice date
     * - Uses the period (first day of month) as the revenue period
     * - Creates invoice with random amount and status
     */
    for (let i = 0; i < SEED_CONFIG.INVOICE_COUNT; i++) {
      const customer =
        existingCustomers[Math.floor(Math.random() * existingCustomers.length)];

      const period = periods[Math.floor(Math.random() * periods.length)];

      if (!customer?.id) {
        throw new Error(`Invalid customer at index ${i}`);
      }
      if (!period) {
        throw new Error(`Invalid period at index ${i}`);
      }
      validatePeriod(period);

      // Revenue period is always the first day of the month
      const revenuePeriod = new Date(`${period}T00:00:00.000Z`);

      // Generate a random date within the same month as the period
      const [year, month] = period.split("-").map(Number);

      if (
        !year ||
        !month ||
        month < SEED_CONFIG.MIN_MONTH ||
        month > SEED_CONFIG.MONTHS_IN_YEAR
      ) {
        throw new Error(
          `Invalid period format: ${period}. Expected YYYY-MM-DD`,
        );
      }

      const daysInMonth = new Date(year, month, 0).getDate();
      const randomDay =
        Math.floor(Math.random() * daysInMonth) +
        SEED_CONFIG.FIRST_DAY_OF_MONTH;
      const invoiceDate = new Date(Date.UTC(year, month - 1, randomDay));

      invoiceRows.push({
        amount: generateInvoiceAmount(),
        customerId: customer.id,
        date: invoiceDate, // Random date within the month
        revenuePeriod: revenuePeriod as Period, // Always first day of the month
        status: randomInvoiceStatus(),
      });
    }

    if (invoiceRows.length > 0) {
      await tx.insert(schema.invoices).values(invoiceRows);
    }

    // 4) Seed demo user counters (one per role)
    await tx.insert(schema.demoUserCounters).values(
      roles.map((role) => ({
        count:
          Math.floor(
            Math.random() *
              (SEED_CONFIG.DEMO_COUNTER_MAX - SEED_CONFIG.DEMO_COUNTER_MIN + 1),
          ) + SEED_CONFIG.DEMO_COUNTER_MIN,
        role,
      })),
    );

    // 5) Seed users (pre-hashed passwords)
    await tx.insert(schema.users).values(userSeed);

    // 6) Recompute revenue aggregates from invoices
    await tx.execute(sql`
            UPDATE revenues AS r
            SET total_amount  = COALESCE(agg.total_amount, 0),
                invoice_count = COALESCE(agg.invoice_count, 0),
                updated_at    = NOW() FROM (
  SELECT
    invoices.revenue_period AS period,
    SUM(invoices.amount) AS total_amount,
    COUNT(*) AS invoice_count
  FROM invoices
  GROUP BY invoices.revenue_period
) AS agg
            WHERE r.period = agg.period;
        `);
  });

  console.log("Database seeded successfully.");
}

// Execute seeding with proper error handling and process exit
main().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
