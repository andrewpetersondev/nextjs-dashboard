import "server-only";

import bcryptjs from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
	try {
		const salt = await bcryptjs.genSalt(SALT_ROUNDS);
		return await bcryptjs.hash(password, salt);
	} catch (error) {
		console.error("Error while hashing password:", error);
		throw error;
	}
};

export async function comparePassword(
	plainPassword: string,
	hashedPassword: string,
): Promise<boolean> {
	return bcryptjs.compare(plainPassword, hashedPassword);
}
