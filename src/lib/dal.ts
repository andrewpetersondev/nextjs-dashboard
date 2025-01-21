import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // console.log("dal--> verifySession -->cookie", cookie); // returns long cookie hash
  console.log("dal--> verifySession --> session", session); // returns {user:{sessionId: aaa, expiresAt:aaa, userId: aaa}, iat: aaa, exp: aaa }

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();

  console.log("dal--> getuser -->session", session);
  console.log("{session}", { session });

  if (!session) return null;

  try {
    const search = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
      })
      .from(users);
    // todo: WHAT ARE THE TYPES OF THESE PARAMETERS?
    // .where(eq(users.id, session.userId));
    console.log("search", search);
    const user = search[0];
    console.log("user", user);
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    console.log("Failed to fetch user");
    return null;
  }
});