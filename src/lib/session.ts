import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { type SessionPayload, type Session } from "@/lib/definitions";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not defined");
}

// const encodedKey = new TextEncoder().encode(secretKey);
const getEncodedKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
};
const encodedKey = getEncodedKey(); // Replace global variable usage

// export async function encrypt(payload: SessionPayload): Promise<string> {
//     if (!payload?.user?.userId || !payload?.user?.role || !payload?.user?.expiresAt) {
//         throw new Error("Invalid session payload: Missing required fields");
//     }
//
//     if (process.env.NODE_ENV === "development") {
//         console.log("encrypt payload (debug):", {userId: payload.user.userId});
//     }
//
//     if (
//         !payload?.user?.userId ||
//         typeof payload.user.userId !== "string" ||
//         !payload.user.role ||
//         !["user", "admin"].includes(payload.user.role) ||
//         !payload.user.expiresAt ||
//         isNaN(Date.parse(payload.user.expiresAt))
//     ) {
//         throw new Error("Invalid session payload: Incorrect or missing fields");
//     }
//
//     try {
//         return new SignJWT(payload)
//             .setProtectedHeader({alg: "HS256"})
//             .setIssuedAt()
//             .setExpirationTime("7d")
//             .sign(encodedKey);
//     } catch (error) {
//         console.error("Error while encrypting session: ", error);
//         throw new Error("Session encryption failed.")
//     }
// }

export async function encrypt(payload: SessionPayload): Promise<string> {
  // Validate payload
  if (
    !payload?.user?.userId ||
    typeof payload.user.userId !== "string" ||
    !payload.user.role ||
    !["user", "admin"].includes(payload.user.role) ||
    !payload.user.expiresAt ||
    isNaN(Date.parse(payload.user.expiresAt))
  ) {
    throw new Error("Invalid session payload: Incorrect or missing fields");
  }

  // Minimal payload to avoid bloat
  const minimalPayload = {
    user: {
      userId: payload.user.userId,
      role: payload.user.role,
      expiresAt: payload.user.expiresAt,
    },
  };

  try {
    // Sign JWT
    return await new SignJWT(minimalPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30 d")
      .sign(encodedKey); // Dynamically fetch secret if needed
  } catch (error) {
    console.error("Error during JWT creation:", error);
    throw new Error("Session encryption failed");
  }
}

export async function decrypt(session?: string): Promise<Session> {
  try {
    if (!session) {
      return undefined;
    }
    console.log("decrypt");
    console.log("session = ", session);
    const { payload }: { payload: Session } = await jwtVerify(
      session,
      encodedKey,
      {
        algorithms: ["HS256"],
      },
    );
    console.log("payload = session = ", payload);
    if (!payload || !payload.user) {
      return undefined;
    }
    return payload;
  } catch (error) {
    console.error("Failed to verify session", error);
  }
}

export async function createSession(userId: string): Promise<void> {
  console.log("createSession");
  console.log("userId = ", userId);

  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({
      user: { userId, role: "user", expiresAt: expiresAt.toISOString() },
    });

    const cookieStore = await cookies();

    try {
      cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
      });
      console.log("cookie store set session = ", session);
    } catch (error) {
      console.error("cookie store set error: ", error);
    }
  } catch (error) {
    console.error("createSession error: ", error);
  }
}

export async function updateSession(): Promise<null | void> {
  try {
    const session = (await cookies()).get("session")?.value;
    const payload = await decrypt(session);

    if (!session || !payload || !payload.user) {
      return null;
    }

    // Validate the existing session payload
    const { user } = payload;
    if (
      !user.userId ||
      typeof user.userId !== "string" ||
      !user.role ||
      !["user", "admin"].includes(user.role) ||
      !user.expiresAt ||
      (typeof user.expiresAt === "string" &&
        isNaN(Date.parse(user.expiresAt))) ||
      (user.expiresAt instanceof Date && isNaN(user.expiresAt.getTime()))
    ) {
      console.error("Invalid session payload during update");
      return null;
    }

    // Determine new expiration time
    const now = Date.now();
    const currentExpiresAt = new Date(user.expiresAt).getTime();
    const expiresAt =
      currentExpiresAt > now
        ? new Date(currentExpiresAt + 7 * 24 * 60 * 60 * 1000) // Extend expiration
        : new Date(now + 7 * 24 * 60 * 60 * 1000); // Set a new expiration if expired

    // Prepare minimal payload
    const minimalPayload = {
      user: {
        userId: user.userId,
        role: user.role,
        expiresAt: expiresAt.toISOString(),
      },
    };

    // Encrypt the minimal payload
    const updatedToken = await encrypt(minimalPayload);

    const cookieStore = await cookies();
    cookieStore.set("session", updatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
    console.log("Session successfully updated");
  } catch (error) {
    console.error("updateSession error: ", error);
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// how to include db sessions
// To create and manage database sessions, you'll need to follow these steps:
// Create a table in your database to store session and data (or check if your Auth Library handles this).
// Implement functionality to insert, update, and delete sessions
// Encrypt the session ID before storing it in the user's browser, and ensure the database and cookie stay in
// sync (this is optional, but recommended for optimistic auth checks in Middleware).
