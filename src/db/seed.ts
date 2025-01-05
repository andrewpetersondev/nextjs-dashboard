import { db } from "@/src/db/database";
import { customers, invoices, revenue, users } from "@/src/db/schema";
import {
  users as placeholderUsers,
  customers as placeholderCustomers,
  // invoices as placeholderInvoices,
  revenue as placeholderRevenue,
} from "@/src/db/placeholder-data";

async function seedUsers() {
  try {
    await db.insert(users).values(placeholderUsers);
    console.log("Seeding users completed successfully!");
  } catch (e) {
    console.error("Error seeding users:", e);
  }
}

async function seedCustomers() {
  try {
    const customerData = placeholderCustomers.map(({ id, name, email }) => ({
      id,
      name,
      email,
      phone: "N/A", // Assuming phone isn't provided in placeholder data.
    }));
    await db.insert(customers).values(customerData);
    console.log("Seeding customers completed successfully!");
  } catch (e) {
    console.error("Error seeding customers:", e);
  }
}

// async function seedInvoices() {
//   try {
//     const invoiceData = placeholderInvoices.map(
//       ({ customer_id, amount, status, date }) => ({
//         customer_id,
//         amount,
//         status,
//         date: new Date(date),
//       }),
//     );
//     await db.insert(invoices).values(invoiceData);
//     console.log("Seeding invoices completed successfully!");
//   } catch (e) {
//     console.error("Error seeding invoices:", e);
//   }
// }

async function seedRevenue() {
  try {
    await db.insert(revenue).values(placeholderRevenue);
    console.log("Seeding revenue completed successfully!");
  } catch (e) {
    console.error("Error seeding revenue:", e);
  }
}

// Run all seeds
async function runSeeds() {
  await seedUsers();
  await seedCustomers();
  // await seedInvoices();
  await seedRevenue();
}

runSeeds()
  .then(() => console.log("All seeding completed!"))
  .catch((error) => console.error("Seeding process failed:", error));