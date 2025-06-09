import "server-only";

import {
	type DecryptPayload,
	DecryptPayloadSchema,
	type EncryptPayload,
	EncryptPayloadSchema,
	type UserSessionRole,
} from "@/src/lib/definitions/session";
import { ValidationError } from "@/src/lib/errors/validation-error";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const getEncodedKey = async () => {
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const secret = process.env.SESSION_SECRET!;
	if (!secret) {
		throw new Error("SESSION_SECRET is not defined");
	}
	return new TextEncoder().encode(secret);
};

let encodedKey: Uint8Array;

const initializeEncodedKey = async () => {
	encodedKey = await getEncodedKey();
};

export async function encrypt(payload: EncryptPayload): Promise<string> {
	await initializeEncodedKey();
	try {
		const validatedFields = EncryptPayloadSchema.safeParse(payload);
		if (!validatedFields.success) {
			// Log structured error for observability
			console.error("Session payload validation failed", {
				errors: validatedFields.error.flatten().fieldErrors,
				payload,
			});
			// Throw custom error with details (do not leak sensitive data)
			throw new ValidationError(
				"Invalid session payload: Missing or invalid required fields",
				validatedFields.error.flatten().fieldErrors,
			);
		}
		const validatedPayload = validatedFields.data;
		const jwt = await new SignJWT(validatedPayload)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("30 d")
			.sign(encodedKey);
		return jwt;
	} catch (error) {
		console.error("Error during JWT creation:", error);
		throw new Error("DecryptPayload encryption failed");
	}
}

export async function decrypt(
	session?: string,
): Promise<DecryptPayload | undefined> {
	await initializeEncodedKey();
	if (!session) {
		return undefined;
	}
	try {
		const { payload } = (await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		})) as { payload: DecryptPayload };
		const validatedFields = DecryptPayloadSchema.safeParse(payload);
		if (!validatedFields.success) {
			console.error(
				"Invalid session payload",
				validatedFields.error.flatten().fieldErrors,
			);
			return undefined;
		}
		const validatedPayload = validatedFields.data;
		return validatedPayload;
	} catch (error) {
		console.error("Failed to verify session", error);
		return undefined;
	}
}

export async function createSession(
	userId: string,
	role: UserSessionRole = "user",
): Promise<void> {
	try {
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime();
		const session = await encrypt({
			user: { userId, role, expiresAt },
		});
		const cookieStore = await cookies();
		cookieStore.set("session", session, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			expires: new Date(expiresAt),
			sameSite: "lax",
			path: "/",
		});
	} catch (error) {
		console.error("createSession error: ", error);
	}
}

// This function is not used.
// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
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
		const cookieStore = await cookies();
		cookieStore.set("session", updatedToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			expires: newExpiration,
			sameSite: "lax",
			path: "/",
		});
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
