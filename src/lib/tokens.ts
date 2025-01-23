import { db } from "@/db/database";
import { users, sessions } from "@/db/schema";

export async function findToken(userId: string) {
  console.log(userId);

  return "token";
}