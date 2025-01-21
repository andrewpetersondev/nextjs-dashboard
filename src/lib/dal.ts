import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validate as isUUID } from "uuid";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // console.log("dal--> verifySession -->cookie", cookie); // returns long cookie hash
  // console.log("dal--> verifySession --> session", session); // returns {user:{sessionId: aaa, expiresAt:aaa, userId: aaa}, iat: aaa, exp: aaa }

  if (!session?.user?.userId) {
    // Do NOT redirect here; just return false
    return { isAuth: false, userId: null, user: null };
  }
  const userId = session.user.userId;

  try {
    // Query the database to fetch the user's role by ID
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role, // Fetch role from the database
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user.length) {
      // If no user is found, consider the user unauthenticated
      return { isAuth: false, userId: null, user: null };
    }

    // Return session info and user details
    return {
      isAuth: true,
      userId,
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        role: user[0].role, // Include role in the response
      },
    };
  } catch (error) {
    console.error("Failed to verify session and fetch user:", error);
    return { isAuth: false, userId: null, user: null }; // Graceful fallback
  }
});

// Use this wrapper for actions that require a valid session
export async function requireValidSession() {
  const { isAuth, userId } = await verifySession();

  if (!isAuth) {
    redirect("/login");
  }

  return userId;
}

export const getUser = cache(async () => {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId || !isUUID(userId)) return null;

  try {
    const search = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId));
    return search[0] || null;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
});

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}