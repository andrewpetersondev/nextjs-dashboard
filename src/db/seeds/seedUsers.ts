// use local seed file @/app/lib/placeholder-data
import "dotenv/config";
import bcrypt from "bcrypt";
import { users as usersPlaceholderData } from "@/src/lib/placeholder-data";
import { users } from "@/src/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle({ client: pool });

try {
  const result = seedUsers();
  console.log(result);
  console.log("Seeding completed successfully!");
} catch (error) {
  console.error("Error during seeding:", error);
} finally {
  pool.end().then((r) => console.log("Connection closed", r));
}

async function seedUsers() {
  const saltRounds = 10;
  const hashedUsers = await Promise.all(
    usersPlaceholderData.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, saltRounds),
    })),
  );
  await db
    .insert(users)
    .values(hashedUsers)
    .then(() => {
      console.log("Users inserted successfully");
      console.log("Hashed Users", hashedUsers);
    })
    .catch((error) => console.error("Error inserting users:", error));
}

// (async () => {
//   try {
//     await seedUsers();
//     console.log("Seeding completed successfully!");
//   } catch (error) {
//     console.error("Error during seeding:", error);
//   }
// })();