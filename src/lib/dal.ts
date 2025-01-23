import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validate as isUUID } from "uuid";

// Define the structure of your session payload
interface SessionPayload {
  user: {
    userId: string;
    role: string;
    expiresAt: number;
  };
}

export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  // const session = await decrypt(cookie);
  if (!cookie) {
    return null;
  }
  try {
    // Decrypt the session cookie
    const session = (await decrypt(cookie)) as SessionPayload | null;

    // Check if session is valid and not expired
    if (!session || Date.now() > session.user.expiresAt) {
      return null;
    }

    return {
      isAuthenticated: true,
      userId: session.user.userId,
      role: session.user.role,
      expiresAt: session.user.expiresAt,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

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