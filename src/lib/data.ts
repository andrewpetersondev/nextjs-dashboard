import { db } from "@/db/database";
import { formatCurrency } from "@/lib/utils";
import { customers, invoices, revenues } from "@/db/schema";
import {  desc, eq, ilike, or, sql, asc } from "drizzle-orm";

type Revenue = { month: string; revenue: number };

export async function fetchRevenue(): Promise<Revenue[]> {
  const monthOrder = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  try {
    const data: { revenue: number; month: string }[] = await db
      .select()
      .from(revenues);

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

type FilteredInvoiceData = {
  id: string;
  amount: number;
  date: string;
  name: string;
  email: string;
  image_url: string;
  paymentStatus: "pending" | "paid" | null;
};

export async function fetchFilteredInvoices2(
  query: string,
  currentPage: number,
) :Promise<{data: FilteredInvoiceData[], count: number}>{
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const data = await db
      .select({
        record: {
          id: invoices.id,
          amount: invoices.amount,
          date: invoices.date,
          name: customers.name,
          email: customers.email,
          image_url: customers.imageUrl,
          paymentStatus: invoices.status,
        },
        count: sql<number>`count(*) over()`,
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

    const result = {
      data: data.map((item) => item.record),
      count: data[0]?.count ?? 0,
    };

    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}


export async function fetchInvoicesPages(query: string): Promise<number> {
    try {
        const data = await db
            .select({
                record: {
                    id: invoices.id,
                    amount: invoices.amount,
                    date: invoices.date,
                    name: customers.name,
                    email: customers.email,
                    image_url: customers.imageUrl,
                    paymentStatus: invoices.status,
                },
                count: sql<number>`count(*) over()`,
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

        const result = {
            data: data.map((item) => item.record),
            count: data[0]?.count ?? 0,
        };

        //     const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);

        return Math.ceil(result.count / ITEMS_PER_PAGE);
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch total number of invoices.");
    }
}

/*export async function fetchInvoicesPagesById(id: string) {
        try {
            const data = await db
                .select({
                        id: invoices.id,
                        amount: invoices.amount,
                        date: invoices.date,
                        paymentStatus: invoices.status,
                })
                .from(invoices)
                .where(eq(invoices.id, id))
            return data;
        } catch (error) {
            console.error("Database Error:", error);
            throw new Error("Failed to fetch total number of invoices.");
        }
}*/

export async function fetchCustomers() {
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
        ...item, amount: item.amount / 100
    }))
    return result[0];
  } catch (e) {
    console.error("Database Error:", e);
    throw new Error("Failed to fetch invoice by id.");
  }
}

// export async function fetchInvoiceDetailsById(id: string) {
//   try {
//     const invoice = await db
//       .select({
//         id: invoices.id,
//         amount: invoices.amount,
//         paymentStatus: invoices.paymentStatus,
//         customer_id: invoices.customer_id,
//         name: customers.name,
//       })
//       .from(invoices)
//       .innerJoin(customers, eq(invoices.customer_id, customers.id))
//       .where(eq(invoices.id, id));
//     console.log("fetch invoice details by id = ", invoice);
//     return invoice;
//   } catch (e) {
//     console.error("Database Error:", e);
//     throw new Error("Failed to fetch invoice by id.");
//   }
// }

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