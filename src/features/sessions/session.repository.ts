import "server-only";

import { eq } from "drizzle-orm";
import type { Db } from "@/db/connection";
import { getDB } from "@/db/connection";
import { sessions } from "@/db/schema";
import type {
  DbSessionRow,
  SessionRecord,
} from "@/features/sessions/session.types";
import { logger } from "@/lib/utils/utils.server";

/**
 * Maps a DbSessionRow to a SessionRecord for use in the app layer.
 * Converts Date to ISO string and nullables to string.
 */
function mapDbSessionToSessionRecord(row: DbSessionRow): SessionRecord {
  return {
    expiresAt: row.expiresAt.toISOString(),
    id: row.id, // Defensive: never return null, but you may want to handle this differently
    token: row.token ?? "",
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
    const db: Db = getDB();

    await db
      .insert(sessions)
      .values({ ...session, expiresAt: new Date(session.expiresAt) });

    logger.info(
      {
        context: "insertSession",
        sessionId: session.id,
        userId: session.userId,
      },
      "Session inserted into database",
    );
  } catch (error) {
    logger.error(
      { context: "insertSession", err: error, session },
      "Failed to insert a session",
    );
    throw error;
  }
}

/**
 * Deletes a session by its unique ID.
 * @param sessionId - The session's UUID.
 * @throws If the delete fails.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _deleteSessionById(sessionId: string): Promise<void> {
  try {
    const db: Db = getDB();
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    logger.info(
      { context: "deleteSessionById", sessionId },
      "Session deleted from database",
    );
  } catch (error) {
    logger.error(
      { context: "deleteSessionById", err: error, sessionId },
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _findSessionById(
  sessionId: string,
): Promise<SessionRecord | undefined> {
  try {
    const db: Db = getDB();
    const row = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });
    // --- Map Db row to SessionRecord for type safety ---
    return row ? mapDbSessionToSessionRecord(row as DbSessionRow) : undefined;
  } catch (error) {
    logger.error(
      { context: "findSessionById", err: error, sessionId },
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _findSessionByToken(
  token: string,
): Promise<SessionRecord | undefined> {
  try {
    const db: Db = getDB();

    const row = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });
    // --- Map Db row to SessionRecord for type safety ---
    return row ? mapDbSessionToSessionRecord(row as DbSessionRow) : undefined;
  } catch (error) {
    logger.error(
      { context: "findSessionByToken", err: error, token },
      "Failed to find session by token",
    );
    throw error;
  }
}
