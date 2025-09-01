import { eq, inArray, sql } from "drizzle-orm";
import * as schema from "../../src/server/db/schema";
import type { Period } from "../../src/shared/brands/domain-brands";
import { db } from "./config";
import { SEED_CONFIG } from "./constants";
import { generateInvoiceAmount, generateMonthlyPeriods, hashPassword, randomInvoiceStatus, validatePeriod } from "./utils";

const periods = generateMonthlyPeriods("2024-01-01", SEED_CONFIG.GENERATE_MONTHLY_PERIODS_COUNT);
const periodDates = periods.map((p) => new Date(`${p}T00:00:00.000Z`));
const roles = ["guest", "admin", "user"] as const;

const customersData: Array<{ name: string; email: string; imageUrl: string }> = [
  { email: "evil@rabbit.com", imageUrl: "/customers/evil-rabbit.png", name: "Evil Rabbits" },
  { email: "delba@oliveira.com", imageUrl: "/customers/delba-de-oliveira.png", name: "Delba de Oliveira" },
  { email: "lee@robinson.com", imageUrl: "/customers/lee-robinson.png", name: "Lee Robinson" },
  { email: "michael@novotny.com", imageUrl: "/customers/michael-novotny.png", name: "Michael Novotny" },
  { email: "amy@burns.com", imageUrl: "/customers/amy-burns.png", name: "Amy Burns" },
  { email: "balazs@orban.com", imageUrl: "/customers/balazs-orban.png", name: "Balazs Orban" },
];

async function isEmpty(): Promise<boolean> {
  const checks = await Promise.all([
    db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.users} LIMIT 1) AS v`),
    db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.customers} LIMIT 1) AS v`),
    db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.invoices} LIMIT 1) AS v`),
    db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.revenues} LIMIT 1) AS v`),
    db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.demoUserCounters} LIMIT 1) AS v`),
  ]);
  return checks.every((r) => (r as any).rows?.[0]?.v === false);
}

async function truncateAll(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE
    ${schema.sessions},
    ${schema.invoices},
    ${schema.customers},
    ${schema.revenues},
    ${schema.demoUserCounters},
    ${schema.users}
    RESTART IDENTITY CASCADE`);
}

export async function mainCypTestSeed(): Promise<void> {
  const shouldReset = process.env.SEED_RESET === "true";
  if (shouldReset) {
    await truncateAll();
  } else {
    const empty = await isEmpty();
    if (!empty) {
      // eslint-disable-next-line no-console
      console.error("Database is not empty. Set SEED_RESET=true to force reseed. Exiting...");
      return;
    }
  }

  const userSeed = [
    { email: "user@user.com", password: await hashPassword("UserPassword123!"), role: "user" as const, username: "user" },
    { email: "admin@admin.com", password: await hashPassword("AdminPassword123!"), role: "admin" as const, username: "admin" },
    { email: "guest@guest.com", password: await hashPassword("GuestPassword123!"), role: "guest" as const, username: "guest" },
  ];

  await db.transaction(async (tx) => {
    await tx.insert(schema.revenues).values(
      periodDates.map((periodDate) => ({
        calculationSource: "seed" as const,
        invoiceCount: 0,
        period: periodDate as Period,
        totalAmount: 0,
      })),
    );

    await tx.insert(schema.customers).values(
      customersData.map((c) => ({ email: c.email, imageUrl: c.imageUrl, name: c.name })),
    );

    const existingCustomers = await tx.select({ id: schema.customers.id }).from(schema.customers);
    if (existingCustomers.length === 0) throw new Error("No customers found after seeding customers.");

    const invoiceRows: (typeof schema.invoices.$inferInsert)[] = [];
    for (let i = 0; i < SEED_CONFIG.INVOICE_COUNT; i++) {
      const customer = existingCustomers[Math.floor(Math.random() * existingCustomers.length)];
      const period = periods[Math.floor(Math.random() * periods.length)];
      if (!customer?.id) throw new Error(`Invalid customer at index ${i}`);
      if (!period) throw new Error(`Invalid period at index ${i}`);
      validatePeriod(period);
      const revenuePeriod = new Date(`${period}T00:00:00.000Z`);
      const [year, month] = period.split("-").map(Number);
      if (!year || !month || month < SEED_CONFIG.MIN_MONTH || month > SEED_CONFIG.MONTHS_IN_YEAR) {
        throw new Error(`Invalid period format: ${period}. Expected YYYY-MM-DD`);
      }
      const daysInMonth = new Date(year, month, 0).getDate();
      const randomDay = Math.floor(Math.random() * daysInMonth) + SEED_CONFIG.FIRST_DAY_OF_MONTH;
      const invoiceDate = new Date(Date.UTC(year, month - 1, randomDay));

      invoiceRows.push({
        amount: generateInvoiceAmount(),
        customerId: customer.id,
        date: invoiceDate,
        revenuePeriod: revenuePeriod as Period,
        status: randomInvoiceStatus(),
      });
    }
    if (invoiceRows.length > 0) await tx.insert(schema.invoices).values(invoiceRows);

    await tx.insert(schema.demoUserCounters).values(
      roles.map((role) => ({
        count: Math.floor(Math.random() * (SEED_CONFIG.DEMO_COUNTER_MAX - SEED_CONFIG.DEMO_COUNTER_MIN + 1)) + SEED_CONFIG.DEMO_COUNTER_MIN,
        role,
      })),
    );

    await tx.insert(schema.users).values(userSeed);

    await tx.execute(sql`
      UPDATE revenues AS r
      SET total_amount  = COALESCE(agg.total_amount, 0),
          invoice_count = COALESCE(agg.invoice_count, 0),
          updated_at    = NOW() FROM (
        SELECT invoices.revenue_period AS period, SUM(invoices.amount) AS total_amount, COUNT(*) AS invoice_count
        FROM invoices
        GROUP BY invoices.revenue_period
      ) AS agg
      WHERE r.period = agg.period;
    `);
  });

  // eslint-disable-next-line no-console
  console.log("Database seeded successfully.");
}

export async function upsertE2EUser(user: { email: string; password: string; role?: "user" | "admin" | "guest" }): Promise<void> {
  if (!user) throw new Error("upsertE2EUser requires user object");
  if (!user.email || !user.password) throw new Error("upsertE2EUser requires email and password");
  const normalizedEmail = user.email.trim().toLowerCase();
  const username = (normalizedEmail.includes("@") ? normalizedEmail.split("@")[0] : normalizedEmail).replace(/[^a-zA-Z0-9_]/g, "_");
  const role = user.role ?? "user";
  const hashed = await hashPassword(user.password);

  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      const userId = existing[0].id;
      await tx.update(schema.users).set({ password: hashed, role, username }).where(eq(schema.users.id, userId));
      await tx.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
    } else {
      const inserted = await tx.insert(schema.users).values([{ email: normalizedEmail, password: hashed, role, username }]).returning({ id: schema.users.id });
      const userId = inserted[0]?.id;
      if (!userId) throw new Error("Failed to insert E2E user");
      await tx.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
    }
  });
}

export async function userExists(email: string): Promise<boolean> {
  if (!email) return false;
  const res = await db.execute(sql`SELECT EXISTS(SELECT 1 FROM ${schema.users} WHERE ${schema.users.email} = ${email}) AS v`);
  return Boolean((res as any)?.rows?.[0]?.v);
}

export async function cleanupE2EUsers(): Promise<void> {
  const usersToDelete = await db.execute(sql`
    SELECT id FROM ${schema.users}
    WHERE ${schema.users.email} LIKE 'e2e_%' OR ${schema.users.username} LIKE 'e2e_%'
  `);
  const ids: string[] = (usersToDelete as any).rows?.map((r: any) => r.id).filter(Boolean) ?? [];
  if (ids.length === 0) return;
  await db.transaction(async (tx) => {
    await tx.delete(schema.sessions).where(inArray(schema.sessions.userId, ids));
    await tx.delete(schema.users).where(inArray(schema.users.id, ids));
  });
}
