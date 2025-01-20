// import { z } from "zod";
import type { User } from "@/types/definitions";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserForAuth(
  emailCredential: string,
): Promise<User | undefined> {
  console.log("emailCredential", emailCredential);
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        username: users.username,
      })
      .from(users)
      .where(eq(users.email, emailCredential));

    const userObj = user[0];
    console.log("userObj", userObj);

    return userObj;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}