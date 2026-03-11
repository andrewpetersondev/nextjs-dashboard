import type { Hash } from "@database";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import bcryptjs from "bcryptjs";

/**
 * Pure mapping to brand a trusted hash string.
 * Use this only for values already hashed by the system or retrieved from DB.
 */
const toHash = (value: string): Hash => value as unknown as Hash;

/**
 * Hashes a password using bcrypt with configured salt rounds.
 */
export async function hashPassword(password: string): Promise<Hash> {
	const salt = await bcryptjs.genSalt(SEED_CONFIG.saltRounds);
	const hashed = bcryptjs.hash(password, salt);
	const branded = toHash(await hashed);
	return branded;
}
