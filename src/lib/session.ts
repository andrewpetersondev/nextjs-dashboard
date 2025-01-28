import "server-only";
import { SignJWT, jwtVerify } from "jose";
import {
  type DecryptPayload,
  type EncryptPayload,
  EncryptPayloadSchema,
  DecryptPayloadSchema,
} from "@/lib/definitions";
import { cookies } from "next/headers";

const getEncodedKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
};

const encodedKey: Uint8Array<ArrayBufferLike> = getEncodedKey();

export async function encrypt(payload: EncryptPayload): Promise<string> {
  try {
    // const validatedFields = SessionPayload.safeParse({
    //   user: {
    //     userId: payload.user.userId,
    //     role: payload.user.role,
    //     expiresAt: payload.user.expiresAt,
    //   },
    // });
    const validatedFields = EncryptPayloadSchema.safeParse(payload);

    if (!validatedFields.success) {
      throw new Error("Invalid session payload: Missing required fields");
    }

    const validatedPayload = validatedFields.data;

    const jwt = await new SignJWT(validatedPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30 d")
      .sign(encodedKey);
    console.log("encrypt jwt after  sign = ", jwt);
    return jwt;
  } catch (error) {
    console.error("Error during JWT creation:", error);
    throw new Error("DecryptPayload encryption failed");
  }
}

export async function decrypt(
  session?: string,
): Promise<DecryptPayload | undefined> {
  if (!session) {
    return undefined;
  }
  try {
    const { payload } = (await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })) as { payload: DecryptPayload };
    // const validatedFields = DecryptSessionPayload.safeParse({
    //   user: {
    //     userId: payload.user.userId,
    //     role: payload.user.role,
    //     expiresAt: payload.user.expiresAt,
    //     isAuthorized: payload?.user?.isAuthorized,
    //   },
    //   iat: payload.iat,
    //   exp: payload.exp,
    // });
    const validatedFields = DecryptPayloadSchema.safeParse(payload);
    if (!validatedFields.success) {
      console.error(
        "Invalid session payload",
        validatedFields.error.flatten().fieldErrors,
      );
      return undefined;
      // throw new Error("Invalid session payload: Missing required fields");
    }
    const validatedPayload = validatedFields.data;
    return validatedPayload;
  } catch (error) {
    console.error("Failed to verify session", error);
    return undefined;
  }
}

export async function createSession(userId: string): Promise<void> {
  console.log("createSession()");
  console.log("userId = ", userId);
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime();

    const session = await encrypt({
      user: { userId: userId, role: "user", expiresAt: expiresAt },
    });
    console.log(session);

    try {
      const cookieStore = await cookies();
      cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // expires: expiresAt,
        expires: new Date(expiresAt),
        sameSite: "lax",
        path: "/",
      });
      console.log("cookie store set session = ", session);
    } catch (error) {
      console.error("cookie store set error: ");
      console.error(error);
    }
  } catch (error) {
    console.error("createSession error: ");
    console.error(error);
  }
}

export async function updateSession(): Promise<null | void> {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return null;
  }

  const payload = await decrypt(session);

  if (!payload || !payload.user) {
    return null;
  }

  const now = Date.now();
  const expiration = new Date(payload?.user?.expiresAt).getTime();

  if (now > expiration) {
    return null;
  }

  const { user } = payload;

  try {
    const newExpiration = new Date(expiration + 1000 * 60 * 60 * 24).getTime();

    const minimalPayload = {
      user: {
        userId: user.userId,
        role: user.role,
        expiresAt: newExpiration,
      },
    };

    const updatedToken = await encrypt(minimalPayload);

    console.log("updateSession updatedToken = ", updatedToken);

    const cookieStore = await cookies();
    cookieStore.set("session", updatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: newExpiration,
      sameSite: "lax",
      path: "/",
    });
    console.log("DecryptPayload successfully updated");
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

// const encodedKey = new TextEncoder().encode(secretKey);

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
//         throw new Error("DecryptPayload encryption failed.")
//     }
// }
