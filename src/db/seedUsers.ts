// use local seed file @/app/lib/placeholder-data
import "dotenv/config";
import bcrypt from "bcryptjs";
import { users } from "@/src/db/schema";
import { db } from "@/db/database"

const mockUsers = [
  {
    username: "cool username",
    email: "me@mail.com",
    password: "password",
  }
]

async function seedUsers() {
  const saltRounds = 10;
  const hashedUsers = await Promise.all(
    mockUsers.map(async (user) => ({
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
//   } catch (error) {
//     console.error("Error during seeding:", error);
//     throw new Error("Seeding failed. Please check the logs for more details.");
//   }
// })();

try {
  seedUsers()
}catch (e) {
  console.error(e)
  throw new Error("some soort of error")
}