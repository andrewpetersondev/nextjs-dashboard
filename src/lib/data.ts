import { sql } from "@vercel/postgres";
import { db } from "@/src/db/database";
import {
  CustomerField,
  CustomersTableType,
  Invoice,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  LatestInvoiceRaw,
  Revenue,
} from "@/src/lib/definitions";
import { formatCurrency } from "@/src/lib/utils";
import { customers, invoices, revenue } from "@/src/db/schema";
import { desc, count, eq } from "drizzle-orm";

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
      .from(revenue);

    const orderedData = data.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );

    // console.log("data", orderedData);
    return orderedData;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices(): Promise<
  {
    amount: string;
    email: string;
    id: string;
    image_url: string;
    name: string;
  }[]
> {
  try {
    const data: {
      amount: number;
      email: string;
      id: string;
      image_url: string;
      name: string;
    }[] = await db
      .select({
        amount: invoices.amount,
        name: customers.name,
        image_url: customers.image_url,
        email: customers.email,
        id: invoices.id,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
      .orderBy(desc(invoices.date))
      .limit(5);

    const latestInvoices: {
      amount: string;
      name: string;
      email: string;
      image_url: string;
      id: string;
    }[] = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

// fetchLatestInvoices().then((response) => {
//   console.log("response", response);
// });

export async function fetchCardData() {
  try {
    const invoiceCount: number = await db.$count(invoices);
    const customerCount: number = await db.$count(customers);
    const paidInvoices: number = await db.$count(
      invoices,
      eq(invoices.paymentStatus, "paid"),
    );
    const pendingInvoices: number = await db.$count(
      invoices,
      eq(invoices.paymentStatus, "pending"),
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

// fetchCardData().then((response) => {
//   console.log("response", response);
// });

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
            SELECT invoices.id,
                   invoices.amount,
                   invoices.date,
                   invoices.status,
                   customers.name,
                   customers.email,
                   customers.image_url
            FROM invoices
                     JOIN customers ON invoices.customer_id = customers.id
            WHERE customers.name ILIKE ${`%${query}%`}
               OR customers.email ILIKE ${`%${query}%`}
               OR invoices.amount::text ILIKE ${`%${query}%`}
               OR invoices.date::text ILIKE ${`%${query}%`}
               OR invoices.status ILIKE ${`%${query}%`}
            ORDER BY invoices.date DESC
            LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
                                FROM invoices
                                         JOIN customers ON invoices.customer_id = customers.id
                                WHERE customers.name ILIKE ${`%${query}%`}
                                   OR customers.email ILIKE ${`%${query}%`}
                                   OR invoices.amount::text ILIKE ${`%${query}%`}
                                   OR invoices.date::text ILIKE ${`%${query}%`}
                                   OR invoices.status ILIKE ${`%${query}%`}
        `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
            SELECT invoices.id,
                   invoices.customer_id,
                   invoices.amount,
                   invoices.paymentStatus
            FROM invoices
            WHERE invoices.id = ${id};
        `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice, // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
            SELECT id,
                   name
            FROM customers
            ORDER BY name ASC
        `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
            SELECT customers.id,
                   customers.name,
                   customers.email,
                   customers.image_url,
                   COUNT(invoices.id)  AS total_invoices,
                   SUM(CASE
                           WHEN invoices.status = 'pending' THEN invoices.amount
                           ELSE 0 END) AS total_pending,
                   SUM(CASE
                           WHEN invoices.status = 'paid' THEN invoices.amount
                           ELSE 0 END) AS total_paid
            FROM customers
                     LEFT JOIN invoices ON customers.id = invoices.customer_id
            WHERE customers.name ILIKE ${`%${query}%`}
               OR customers.email ILIKE ${`%${query}%`}
            GROUP BY customers.id, customers.name, customers.email, customers.image_url
            ORDER BY customers.name ASC
        `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}