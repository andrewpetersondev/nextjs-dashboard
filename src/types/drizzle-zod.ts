import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { users } from "@/db/schema";
import { db } from "@/db/database";
import { eq } from "drizzle-orm";

// SELECT
const userSelectSchema = createSelectSchema(users);
const rows = await db.select().from(users).limit(1);
const parsedUserSelect: {
  id: string;
  username: string;
  email: string;
  password: string;
} = userSelectSchema.parse(rows[0]); // Will parse successfully

// INSERT
const userInsertSchema = createInsertSchema(users);
const userInsert = { username: "user1", password: "password" };
const parsedUserInsert: { username: string; password: string } =
  userInsertSchema.parse(userInsert); // Will parse successfully
await db.insert(users).values(parsedUserInsert);

// UPDATE
const userUpdateSchema = createUpdateSchema(users);
const userUpdate = { age: 35 };
const parsedUserUpdate: {
  username?: string | undefined;
  password?: string | undefined;
} = userUpdateSchema.parse(userUpdate); // Will parse successfully
await db.update(users).set(parsedUserUpdate).where(eq(users.username, "Jane"));