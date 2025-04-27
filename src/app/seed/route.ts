// import bcryptjs from "bcryptjs";
// import {
//   invoices as invoicesPlaceholderData,
//   customers as customersPlaceholderData,
//   revenue as revenuePlaceholderData,
//   users as usersPlaceholderData,
// } from "@/src/db/placeholder-data";
//
// import { db } from "@/src/db/database";
// import { users, invoices, revenue, customers } from "@/src/db/schema";
//
// async function seedUsers() {
//   console.log("seeding users...");
//   try {
//     const saltRounds = 10;
//     const hashedUsers = await Promise.all(
//       usersPlaceholderData.map(async (user) => ({
//         ...user,
//         password: await bcryptjs.hash(user.password, saltRounds),
//       })),
//     );
//     await db.insert(users).values(hashedUsers);
//     console.log("Users inserted!");
//   } catch (e) {
//     console.error("Error seeding users...");
//     console.error(e);
//   }
// }
//
// async function seedCustomers() {
//   try {
//     console.log("seeding customers...");
//     await db.insert(customers).values(customersPlaceholderData);
//     console.log("Customers inserted!");
//   } catch (e) {
//     console.error("Error seeding customers...");
//     console.error(e);
//   }
// }
//
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
//
// async function seedRevenue() {
//   try {
//     console.log("seeding revenue...");
//     await db.insert(revenue).values(revenuePlaceholderData);
//     console.log("Revenue inserted!");
//   } catch (e) {
//     console.error("Error seeding revenue...");
//     console.error(e);
//   }
// }
//
// export async function GET() {
//   try {
//     await seedUsers();
//     await seedCustomers();
//     await seedInvoices();
//     await seedRevenue();
//
//     return Response.json({ message: "Database seeded successfully" });
//   } catch (error) {
//     return Response.json({ error }, { status: 500 });
//   }
// }
//
// // Option 2
// // export async function GET() {
// //   try {
// //     await Promise.all([seedUsers(), seedInvoices(), seedRevenue()]);
// //     return Response.json({ message: "Database seeded successfully" });
// //   } catch (error) {
// //     return Response.json({ error }, { status: 500 });
// //   }
// // }

// Basic GET handler to return a simple response
export async function GET() {
  return new Response(JSON.stringify({ message: "GET request received" }), {
    status: 200,
  });
}
