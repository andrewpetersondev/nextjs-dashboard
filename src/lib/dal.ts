import "server-only";

// import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
// import { db } from "@/db/database";
// import { users } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { validate as isUUID } from "uuid";
// import { redirect } from "next/navigation";

// Define the structure of your session payload
interface SessionPayload {
  user: {
    userId: string;
    role: string;
    expiresAt: Date;
  };
}

// uses cookies for verification
export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    return null;
  }
  try {
    // Decrypt the session cookie
    const session = (await decrypt(cookie)) as SessionPayload;

    // Check if session is valid and not expired
    if (!session || new Date() > session.user.expiresAt) {
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
// export async function requireValidSession() {
//   const { isAuthenticated, userId, role, expiresAt } = await verifySession();
//
//   if (!session) {
//     redirect("/login");
//     return;
//   }
//
//   if (!isAuthenticated) {
//     redirect("/login");
//   }
//
//   return userId;
// }

// this reads cookies, then makes a db call to get more information about the user
// export const getUser = cache(async () => {
//   const { isAuth, userId } = await verifySession();
//   if (!isAuth || !userId || !isUUID(userId)) return null;
//
//   try {
//     const search = await db
//       .select({
//         id: users.id,
//         username: users.username,
//         email: users.email,
//         role: users.role,
//       })
//       .from(users)
//       .where(eq(users.id, userId));
//     const result = search[0] || null;
//     return result;
//   } catch (error) {
//     console.error("Failed to fetch user:", error);
//     return null;
//   }
// });