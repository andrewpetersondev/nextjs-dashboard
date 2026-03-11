import type { UserRole } from "@database";

/**
 * Normalize and validate an email string for devtools user tasks.
 */
export function normalizeUserEmail(email: string): string {
	const normalizedEmail = email.trim().toLowerCase();

	if (!normalizedEmail) {
		throw new Error("email must be a non-empty string");
	}

	return normalizedEmail;
}

/**
 * Normalize and validate a plaintext password for devtools user tasks.
 */
export function normalizeUserPassword(password: string): string {
	const normalizedPassword = password.trim();

	if (!normalizedPassword) {
		throw new Error("password must be a non-empty string");
	}

	return normalizedPassword;
}

/**
 * Normalize and validate a username for devtools user tasks.
 */
export function normalizeUsername(username: string): string {
	const normalizedUsername = username.trim();

	if (!normalizedUsername) {
		throw new Error("username must be a non-empty string");
	}

	return normalizedUsername;
}

/**
 * Derive a username from an email address for E2E user setup.
 */
export function toUsernameFromEmail(email: string): string {
	const atIndex = email.indexOf("@");
	const baseName = atIndex >= 0 ? email.slice(0, atIndex) : email;
	const normalizedUsername = baseName.replace(/[^a-zA-Z0-9_]/g, "_");

	if (!normalizedUsername) {
		throw new Error("could not derive username from email");
	}

	return normalizedUsername;
}

/**
 * Validate required user-task input fields.
 */
export function validateRequiredUserTaskInput(input: {
	readonly email: string;
	readonly password: string;
	readonly role: UserRole;
}): void {
	if (!(input.email && input.password && input.role)) {
		throw new Error("email, password, and role are required");
	}
}
