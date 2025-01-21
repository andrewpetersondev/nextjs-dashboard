"use server"

import type { User } from "@/types/definitions";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserForAuth(
  emailCredential: string,
): Promise<User | undefined> {
  console.log("emailCredential", emailCredential);
  try {
    const search = await db
      .select()
      .from(users)
      .where(eq(users.email, emailCredential));
    const user = search[0];
    // console.log("user", user);
    // if (!user) return null;
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}