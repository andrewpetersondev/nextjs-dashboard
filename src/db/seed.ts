import { seed } from "drizzle-seed";
import { customers, invoices, people, revenue, users } from "@/src/db/schema";
import { db } from "@/src/db/database";

function runSeeds() {
  const tables = [users, customers, invoices, revenue, people];

  tables.forEach(async (table) => {
    try {
      await seed(db, { table }, { count: 10 });
      console.log(`Seeding ${table} completed successfully!`);
    } catch (e) {
      console.error(`Error seeding ${table}:`, e);
    }
  });
}

runSeeds();

// async function seedUsers() {
//   try {
//     await seed(db, { users }, { count: 10 });
//     console.log("Seeding users completed successfully!");
//   } catch (e) {
//     console.error("Error seeding users:", e);
//   }
// }

// async function seedCustomers() {
//   try {
//     await seed(db, { customers }, { count: 10 });
//     console.log("Seeding customers completed successfully!");
//   } catch (e) {
//     console.error("Error seeding customers:", e);
//   }
// }

// async function seedInvoices() {
//   try {
//     await seed(db, { invoices }, { count: 10 });
//     console.log("Seeding invoices completed successfully!");
//   } catch (e) {
//     console.error("Error seeding invoices:", e);
//   }
// }

// async function seedRevenue() {
//   try {
//     await seed(db, { revenue }, { count: 10 });
//     console.log("Seeding revenues completed successfully!");
//   } catch (e) {
//     console.error("Error seeding revenue:", e);
//   }
// }

// async function seedPeople() {
//   try {
//     await seed(db, { people }, { count: 10 });
//     console.log("Seeding people completed successfully!");
//   } catch (e) {
//     console.error("Error seeding people:", e);
//   }
// }