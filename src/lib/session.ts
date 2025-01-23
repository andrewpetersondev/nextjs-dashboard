import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db/database";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  user: {
    sessionId: string;
    expiresAt: Date;
    userId: string;
    role: string;
  };
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = "",
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session", error);
    return null;
  }
}

// since role is assigned in db, users will always have a role of "user" on first login and when logging in for the first time after cookie expires
export async function createSession(id: string) {
  try {
    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead
    // check to see if user has non-expired session token
    const activeSession = await db
      .select({
        id: sessions.id,
        token: sessions.token,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.userId, id), gt(sessions.expiresAt, now)))
      .limit(1);
    if (activeSession.length) {
      const sessionId = activeSession[0].id;
      const userRole = activeSession[0].role;
      await updateSession(id, sessionId, userRole!);
    } else {
      // if user does not exist or does not have session token, then create one
      const data = await db
        .insert(sessions)
        .values({
          userId: id,
          expiresAt: expiresAt,
        })
        .returning({ insertedId: sessions.id });
      const sessionId = data[0]?.insertedId;
      if (!sessionId) {
        throw new Error("Failed to create session in the database.");
      }
      const sessionPayload = {
        user: {
          sessionId,
          expiresAt,
          userId: id,
          role: "user",
        },
      };
      const sessionToken = await encrypt(sessionPayload);
      if (!sessionToken) {
        throw new Error(
          "Failed to encrypt session payload when creating a new user and session.",
        );
      }
      await db
        .update(sessions)
        .set({ token: sessionToken })
        .where(eq(sessions.id, sessionId));
      const cookieStore = await cookies();
      cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
      });
      return true;
    }
  } catch (error) {
    console.error("Error in createSession:", error);
    throw new Error("Failed to create session.");
  }
}

// user has a valid session in db, so extend it. they might not have cookies locally
export async function updateSession(
  id: string,
  sessionId: string,
  userRole: string,
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionPayload = {
    user: {
      sessionId: sessionId,
      expiresAt: expiresAt,
      userId: id,
      role: userRole,
    },
  };
  const updatedSessionToken = await encrypt(sessionPayload);
  if (!updatedSessionToken) {
    throw new Error("Failed to encrypt updated session payload.");
  }
  await db
    .update(sessions)
    .set({ expiresAt, token: updatedSessionToken })
    .where(eq(sessions.id, sessionId));

  const cookieStore = await cookies();
  cookieStore.set("session", updatedSessionToken, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  return true;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}