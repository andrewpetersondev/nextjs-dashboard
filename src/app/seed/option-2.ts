// use local seed file @/app/lib/placeholder-data

import bcrypt from "bcrypt";
import { users as usersPlaceholderData } from "@/src/lib/placeholder-data";

import { users } from "@/src/db/schema";

import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABASE_URL!);

// seed users function
// Part 1: create table --> this is done in schema
// Part 2: insert users

async function seedUsers() {
  const saltRounds = 10;
  const hashedUsers = await Promise.all(
    usersPlaceholderData.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, saltRounds),
    })),
  );
  await db.insert(users).values(hashedUsers);
}

// seedUsers().then((r) => console.log(r));
seedUsers();