import { db } from "@/db/database";
import { formatCurrency } from "@/lib/utils";
import { customers, invoices, revenue } from "@/db/schema";
import { desc, eq, ilike, or, SQL, sql } from "drizzle-orm";

type Revenue = { month: string; revenue: number };

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

    const orderedData: { month: string; revenue: number }[] = data.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );

    // console.log("data", orderedData);
    return orderedData;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

type FetchLatestInvoicesData = {
  amount: number;
  email: string;
  id: string;
  image_url: string;
  name: string;
  paymentStatus: string | null;
};

type ModifiedLatestInvoicesData = Omit<FetchLatestInvoicesData, "amount"> & {
  amount: string;
};

export async function fetchLatestInvoices(): Promise<
  ModifiedLatestInvoicesData[]
> {
  try {
    const data: FetchLatestInvoicesData[] = await db
      .select({
        amount: invoices.amount,
        name: customers.name,
        image_url: customers.image_url,
        email: customers.email,
        id: invoices.id,
        paymentStatus: invoices.paymentStatus,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
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

type FetchFilteredInvoicesData = {
  id: string;
  amount: number;
  date: string;
  name: string;
  email: string;
  image_url: string;
  paymentStatus: "pending" | "paid" | null;
};
// WHEN PERFORMING .JOIN(), DRIZZLE AUTOMATICALLY CREATES A NULLABLE RETURN TYPE
// WHY DOES THIS NULLABLILY ONLY APPEAR ON PAYMENT STATUS!
// TODO: have fetchFilteredInvoices return data as well as the count
// TODO: extract types to separate file
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  // const filters: SQL[] = [];
  // filters.push(ilike(customers.name, `%${query}%`));
  // filters.push(ilike(customers.email, `%${query}%`));
  // filters.push(sql<string>`text(${invoices.amount})`);
  // filters.push(sql<string>`text(${invoices.date})`);
  // filters.push(sql<string>`text(${invoices.paymentStatus})`);
  try {
    const data: FetchFilteredInvoicesData[] = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        date: invoices.date,
        name: customers.name,
        email: customers.email,
        image_url: customers.image_url,
        paymentStatus: invoices.paymentStatus,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.paymentStatus}::text`, `%${query}%`),
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

export async function fetchFilteredInvoices2(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const searchInvoices = await db
      .select()
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
      .where(query ? ilike(invoices.customer_id, query) : undefined);
    console.log(query, currentPage, offset);
    return "fetching";
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

// type FilteredInvoice = {};

// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;
//
//   const whereOptions = or(
//     ilike(customers.name, `%${query}%`),
//     ilike(customers.email, `%${query}%`),
//     ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
//     ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
//   );
//
//   try {
//     const [data, countResult] = await Promise.all([
//       db
//         .select({
//           id: invoices.id,
//           amount: invoices.amount,
//           date: invoices.date,
//           name: customers.name,
//           email: customers.email,
//           image_url: customers.image_url,
//           status: invoices.paymentStatus,
//         })
//         .from(invoices)
//         .innerJoin(customers, eq(invoices.customer_id, customers.id))
//         .where(whereOptions)
//         .orderBy(desc(invoices.date))
//         .limit(ITEMS_PER_PAGE)
//         .offset(offset),
//
//       db
//         .select({
//           value: count(invoices.id),
//         })
//         .from(invoices)
//         .innerJoin(customers, eq(invoices.customer_id, customers.id))
//         .where(whereOptions),
//     ]);
//
//     const count: number = countResult[0].value;
//
//     return {
//       data,
//       count,
//     };
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch invoices.");
//   }
// }

export async function fetchInvoicesPages(query: string) {
  console.log("fetchInvoicesPages fn, query = ", query);
  try {
    const count = await db
      .select({
        count: sql<number>`count
                    (*)`.mapWith(Number),
      })
      .from(invoices)
      .leftJoin(
        customers,
        sql`${invoices.customer_id} =
                ${customers.id}`,
      ).where(sql`${customers.name} ILIKE
                ${`%${query}%`}
                OR
                ${customers.email}
                ILIKE
                ${`%${query}%`}
                OR
                ${invoices.amount}
                ::
                text
                ILIKE
                ${`%${query}%`}
                OR
                ${invoices.date}
                ::
                text
                ILIKE
                ${`%${query}%`}
                OR
                ${invoices.paymentStatus}
                ILIKE
                ${`%${query}%`}`);

    return Math.ceil(count[0].count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

// export async function fetchInvoicesPages(query: string) {
//   console.log("fetchInvoicesPages", query);
//   try {
//     const count = await sql`SELECT COUNT(*)
//                                 FROM invoices
//                                          JOIN customers ON invoices.customer_id = customers.id
//                                 WHERE customers.name ILIKE ${`%${query}%`}
//                                    OR customers.email ILIKE ${`%${query}%`}
//                                    OR invoices.amount::text ILIKE ${`%${query}%`}
//                                    OR invoices.date::text ILIKE ${`%${query}%`}
//                                    OR invoices.status ILIKE ${`%${query}%`}
//         `;
//
//     const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch total number of invoices.");
//   }
// }

// fetchInvoicesPages("").then((response) => {
//   console.log(response);
// });

export async function fetchInvoicesPagesById(id: string) {
  console.log("fetchInvoicesPagesById", id);
  return id;
}

// fetchInvoicesPagesById("item").then((response) => {
//   console.log(response);
// });
// fetchInvoicesPagesById()
// export async function fetchInvoiceById(id: string) {
//   try {
//     const data = await sql<InvoiceForm>`
//             SELECT invoices.id,
//                    invoices.customer_id,
//                    invoices.amount,
//                    invoices.paymentStatus
//             FROM invoices
//             WHERE invoices.id = ${id};
//         `;
//
//     const invoice = data.rows.map((invoice) => ({
//       ...invoice, // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));
//
//     return invoice[0];
//   } catch (error) {
//     console.error("Database Error:", error);
//     throw new Error("Failed to fetch invoice.");
//   }
// }

export async function fetchCustomers() {
  try {
    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(desc(customers.name));
    return data;
  } catch (e) {
    console.error("Database Error:", e);
    throw new Error("Failed to fetch all customers.");
  }
}

// fetchCustomers().then((r) => {
//   console.log(r);
// });

export async function fetchFilteredCustomers(query: string) {
  return query;
}

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType>`
//             SELECT customers.id,
//                    customers.name,
//                    customers.email,
//                    customers.image_url,
//                    COUNT(invoices.id)  AS total_invoices,
//                    SUM(CASE
//                            WHEN invoices.status = 'pending' THEN invoices.amount
//                            ELSE 0 END) AS total_pending,
//                    SUM(CASE
//                            WHEN invoices.status = 'paid' THEN invoices.amount
//                            ELSE 0 END) AS total_paid
//             FROM customers
//                      LEFT JOIN invoices ON customers.id = invoices.customer_id
//             WHERE customers.name ILIKE ${`%${query}%`}
//                OR customers.email ILIKE ${`%${query}%`}
//             GROUP BY customers.id, customers.name, customers.email, customers.image_url
//             ORDER BY customers.name ASC
//         `;
//
//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));
//
//     return customers;
//   } catch (err) {
//     console.error("Database Error:", err);
//     throw new Error("Failed to fetch customer table.");
//   }
// }