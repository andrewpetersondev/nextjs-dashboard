import bcrypt from "bcrypt";
import {
  invoices as invoicesPlaceholderData,
  // customers as customersPlaceholderData,
  revenue as revenuePlaceholderData,
  users as usersPlaceholderData,
} from "@/src/db/placeholder-data";

import { db } from "@/src/db/database";
import { users, invoices, revenue } from "@/src/db/schema";

async function seedUsers() {
  try {
    const saltRounds = 10;
    const hashedUsers = await Promise.all(
      usersPlaceholderData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds),
      })),
    );
    await db.insert(users).values(hashedUsers);
    console.log("users inserted");
  } catch (e) {
    console.error("trouble seeding users", e);
  }
}

async function seedInvoices() {
  try {
    console.log("seeding invoices");
    await db.insert(invoices).values(invoicesPlaceholderData);
  } catch (e) {
    console.error("trouble seeding invoices", e);
  }
}

// async function seedCustomers() {
//   try {
//     console.log("seeding customers");
//     await db.insert(customers).values(customersPlaceholderData);
//   }catch (e) {
//     console.error("trouble seeding customers", e);
//   }
// }

async function seedRevenue() {
  try {
    console.log("seeding revenue");
    await db.insert(revenue).values(revenuePlaceholderData);
  } catch (e) {
    console.error("trouble seeding revenue", e);
  }
}

export async function GET() {
  try {
    await seedUsers();
    // await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

// Option 2
// export async function GET() {
//   try {
//     await Promise.all([seedUsers(), seedInvoices(), seedRevenue()]);
//     return Response.json({ message: "Database seeded successfully" });
//   } catch (error) {
//     return Response.json({ error }, { status: 500 });
//   }
// }