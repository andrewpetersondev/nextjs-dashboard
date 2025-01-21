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
  console.log("dal--> verifySession --> session", session); // returns {user:{sessionId: aaa, expiresAt:aaa, userId: aaa}, iat: aaa, exp: aaa }

  if (!session?.user?.userId) {
    // Do NOT redirect here; just return false
    return { isAuth: false, userId: null };
  }

  return { isAuth: true, userId: session.user.userId };
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

// export const getUser = cache(async () => {
//   const session = await verifySession();
//
//   console.log("dal--> getuser -->session", session);
//   console.log("{session}", { session });
//
//   if (!session) return null;
//
//   try {
//     const search = await db
//       .select({
//         id: users.id,
//         username: users.username,
//         email: users.email,
//       })
//       .from(users)
//       .where(eq(users.id, session.userId));
//     console.log("search", search);
//     const user = search[0];
//     console.log("user", user);
//     return user;
//   } catch (error) {
//     console.error("Failed to fetch user:", error);
//     console.log("Failed to fetch user");
//     return null;
//   }
// });