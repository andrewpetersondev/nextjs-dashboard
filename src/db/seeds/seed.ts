import { db } from "@/db/database";
import {
  users,
  // customers, invoices, revenue
} from "@/db/schema";
import {
  users as usersPlaceholderData,
  // customers as customersPlaceholderData,
  // invoices as invoicesPlaceholderData,
  // revenue as revenuesPlaceHolderData,
} from "@/db/seeds/placeholder-data";
import bcrypt from "bcrypt";

async function seedUsers() {
  console.log("seeding users...");
  try {
    const saltRounds = 10;
    const hashedUsers = await Promise.all(
      usersPlaceholderData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds),
      })),
    );
    await db.insert(users).values(hashedUsers);
    console.log("Users inserted!");
  } catch (e) {
    console.error("Error seeding users...");
    console.error(e);
  }
}

// async function seedCustomers() {
//   try {
//     const customerData = placeholderCustomers.map(({ id, name, email }) => ({
//       id,
//       name,
//       email,
//     }));
//     await db.insert(customers).values(customerData);
//     console.log("Seeding customers completed successfully!");
//   } catch (e) {
//     console.error("Error seeding customers:", e);
//   }
// }

// async function seedCustomers() {
//   try {
//     console.log("seeding customers ...");
//     await db.insert(customers).values(customersPlaceholderData);
//     console.log("customers inserted!");
//   } catch (e) {
//     console.error("Error seeding customers...");
//     console.error(e);
//   }
// }

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

// async function seedInvoices() {
//   try {
//     console.log("seeding invoices...");
//     await db.insert(invoices).values(invoicesPlaceholderData);
//     console.log("Invoices inserted!");
//   } catch (e) {
//     console.error("Error seeding invoices...");
//     console.error(e);
//   }
// }

// async function seedRevenue() {
//   try {
//     console.log("seeding revenue...");
//     await db.insert(revenue).values(revenuesPlaceHolderData);
//     console.log("Revenue inserted!");
//   } catch (e) {
//     console.error("Error seeding revenue...");
//     console.error(e);
//   }
// }

// Run all seeds
async function runSeeds() {
  await seedUsers();
  // await seedCustomers();
  // await seedInvoices();
  // await seedRevenue();
}

runSeeds().then(() =>
  console.log("Seed function ran. Check to see if the data was inserted."),
);