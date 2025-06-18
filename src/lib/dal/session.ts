import "server-only";

import { getDB } from "@/src/db/connection";
import type { DB } from "@/src/db/connection";
import { sessions } from "@/src/db/schema";
import type { SessionRecord } from "@/src/lib/definitions/session";
import type { DbSessionRow } from "@/src/lib/definitions/session";
import { logger } from "@/src/lib/utils/logger";
import { eq } from "drizzle-orm";

/**
 * Maps a DbSessionRow to a SessionRecord for use in the app layer.
 * Converts Date to ISO string and nullables to string.
 */
function mapDbSessionToSessionRecord(row: DbSessionRow): SessionRecord {
	return {
		id: row.id,
		token: row.token ?? "", // Defensive: never return null, but you may want to handle this differently
		expiresAt: row.expiresAt.toISOString(),
		userId: row.userId ?? "",
	};
}

/**
 * Inserts a new session record into the database.
 * @param session - The session record to insert.
 * @throws If the insert fails.
 */
export async function insertSession(session: SessionRecord): Promise<void> {
	try {
		const db: DB = getDB();

		await db
			.insert(sessions)
			.values({ ...session, expiresAt: new Date(session.expiresAt) });

		logger.info(
			{
				sessionId: session.id,
				userId: session.userId,
				context: "insertSession",
			},
			"Session inserted into database",
		);
	} catch (error) {
		logger.error(
			{ err: error, session, context: "insertSession" },
			"Failed to insert session",
		);
		throw error;
	}
}

/**
 * Deletes a session by its unique ID.
 * @param sessionId - The session's UUID.
 * @throws If the delete fails.
 */
export async function deleteSessionById(sessionId: string): Promise<void> {
	try {
		const db: DB = getDB();
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		logger.info(
			{ sessionId, context: "deleteSessionById" },
			"Session deleted from database",
		);
	} catch (error) {
		logger.error(
			{ err: error, sessionId, context: "deleteSessionById" },
			"Failed to delete session",
		);
		throw error;
	}
}

/**
 * Finds a session by its unique ID.
 * @param sessionId - The session's UUID.
 * @returns The session record, or undefined if not found.
 */
export async function findSessionById(
	sessionId: string,
): Promise<SessionRecord | undefined> {
	try {
		const db: DB = getDB();
		const row = await db.query.sessions.findFirst({
			where: eq(sessions.id, sessionId),
		});
		// --- Map DB row to SessionRecord for type safety ---
		return row ? mapDbSessionToSessionRecord(row as DbSessionRow) : undefined;
	} catch (error) {
		logger.error(
			{ err: error, sessionId, context: "findSessionById" },
			"Failed to find session by ID",
		);
		throw error;
	}
}

/**
 * Finds a session by its token.
 * @param token - The session token.
 * @returns The session record, or undefined if not found.
 */
export async function findSessionByToken(
	token: string,
): Promise<SessionRecord | undefined> {
	try {
		const db: DB = getDB();

		const row = await db.query.sessions.findFirst({
			where: eq(sessions.token, token),
		});
		// --- Map DB row to SessionRecord for type safety ---
		return row ? mapDbSessionToSessionRecord(row as DbSessionRow) : undefined;
	} catch (error) {
		logger.error(
			{ err: error, token, context: "findSessionByToken" },
			"Failed to find session by token",
		);
		throw error;
	}
}
