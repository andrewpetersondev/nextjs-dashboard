import bcryptjs from "bcryptjs";
import type { Hash } from "@/server/crypto/hashing/hashing.value";
import { SEED_CONFIG } from "../seed/data/seed.constants";

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
