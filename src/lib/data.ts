import "server-only";

import { db } from "@/src/db/database";
import { formatCurrency } from "@/src/lib/utils";
import { customers, invoices, revenues } from "@/src/db/schema";
import { desc, eq, ilike, or, sql, asc, count } from "drizzle-orm";
import type { CustomerField } from "@/src/lib/definitions";

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
};

export type FilteredInvoiceData = {
  id: string;
  amount: number;
  date: string;
  name: string;
  email: string;
  image_url: string;
  paymentStatus: "pending" | "paid";
};

export type FetchLatestInvoicesData = {
  amount: number;
  email: string;
  id: string;
  image_url: string;
  name: string;
  paymentStatus: string;
};

export type ModifiedLatestInvoicesData = Omit<
  FetchLatestInvoicesData,
  "amount"
> & {
  amount: string;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type FetchFilteredInvoicesData = {
  id: string;
  amount: number;
  date: string;
  name: string;
  email: string;
  image_url: string;
  paymentStatus: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

// @formatter:off
export async function fetchRevenue(): Promise<Revenue[]> {
  const monthOrder = [
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

  try {
    const data: { revenue: number; month: string }[] = await db
      .select()
      .from(revenues);

    const orderedData: {
      month: string;
      revenue: number;
    }[] = data.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );
    return orderedData;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

// @formatter:off
export async function fetchLatestInvoices(): Promise<
  ModifiedLatestInvoicesData[]
> {
  try {
    const data: FetchLatestInvoicesData[] = await db
      .select({
        amount: invoices.amount,
        name: customers.name,
        image_url: customers.imageUrl,
        email: customers.email,
        id: invoices.id,
        paymentStatus: invoices.status,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.date))
      .limit(5);

    const latestInvoices: ModifiedLatestInvoicesData[] = data.map(
      (invoice) => ({
        ...invoice,
        amount: formatCurrency(invoice.amount),
      }),
    );

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

// @formatter:off
export async function fetchCardData() {
  try {
    const invoiceCount: number = await db.$count(invoices);
    const customerCount: number = await db.$count(customers);
    const paidInvoices: number = await db.$count(
      invoices,
      eq(invoices.status, "paid"),
    );
    const pendingInvoices: number = await db.$count(
      invoices,
      eq(invoices.status, "pending"),
    );
    return {
      invoiceCount,
      customerCount,
      paidInvoices,
      pendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;

// @formatter:off
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const data: FetchFilteredInvoicesData[] = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        date: invoices.date,
        name: customers.name,
        email: customers.email,
        image_url: customers.imageUrl,
        paymentStatus: invoices.status,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
        ),
      )
      .orderBy(desc(invoices.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

// @formatter:off
export async function fetchInvoicesPages(query: string): Promise<number> {
  try {
    const data = await db
      .select({
        count: count(invoices.id),
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
        ),
      );

    const result = data[0].count;
    const totalPages = Math.ceil(result / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the total number of invoices.");
  }
}

// @formatter:off
export async function fetchInvoiceById(id: string) {
  try {
    const data = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        status: invoices.status,
        customerId: invoices.customerId,
      })
      .from(invoices)
      .where(eq(invoices.id, id));

    const result = data.map((item) => ({
      ...item,
      amount: item.amount / 100,
    }));
    return result[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice by id.");
  }
}

// @formatter:off
export async function fetchCustomers(): Promise<CustomerField[]> {
  try {
    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(asc(customers.name));
    return data;
  } catch (e) {
    console.error("Database Error:", e);
    throw new Error("Failed to fetch all customers.");
  }
}

// @formatter:off
export async function fetchFilteredCustomers(query: string) {
  try {
    const searchCustomers = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        image_url: customers.imageUrl,
        total_invoices: count(invoices.id),
        total_pending: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'pending')`,
        total_paid: sql<number>`sum(${invoices.amount}) FILTER (WHERE ${invoices.status} = 'paid')`,
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
        ),
      )
      .groupBy(customers.id)
      .orderBy(asc(customers.name));

    const list = searchCustomers.map((item) => ({
      ...item,
      total_pending: formatCurrency(item.total_pending),
      total_paid: formatCurrency(item.total_paid),
    }));
    return list;
  } catch (error) {
    console.error("Fetch Filtered Customers Error:", error);
    throw new Error("Failed to fetch the customer table.");
  }
}
