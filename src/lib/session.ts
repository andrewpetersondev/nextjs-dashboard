import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db/database";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  user: {
    sessionId: string;
    expiresAt: Date;
    userId: string;
  };
};

export async function encrypt(payload: SessionPayload) {
  // console.log("encrypt payload", payload);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = "",
): Promise<SessionPayload | null> {
  // console.log("decrypt session", session);
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

export async function createSession(id: string) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const data = await db
      .insert(sessions)
      .values({
        userId: id,
        expiresAt: expiresAt,
      })
      .returning({ id: sessions.id });
    const sessionId = data[0]?.id;
    if (!sessionId) {
      throw new Error("Failed to create session in the database.");
    }
    const sessionPayload = {
      user: {
        sessionId,
        expiresAt,
        userId: id,
      },
    };
    const sessionToken = await encrypt(sessionPayload);
    if (!sessionToken) {
      throw new Error("Failed to encrypt session payload.");
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
  } catch (error) {
    console.error("Error in createSession:", error);
    throw new Error("Failed to create session.");
  }
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}