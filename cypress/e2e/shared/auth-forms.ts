import type { UserRole } from "@database/schema/schema.constants";

export const E2E_ID_MODULUS = 99_999_999 as const;

// Credentials for the invalid-credentials login test. Both must PASS schema
// validation (PasswordSchema requires a letter, number, and special char) so
// the submission reaches authentication and fails THERE — otherwise the form
// short-circuits with a validation error instead of the unified
// invalid-credentials response.
export const INVALID_EMAIL: string = "invalid@example.com";
export const INVALID_PASSWORD: string = "Wr0ngPassword!";

export const ERROR_MESSAGES_REGEX = {
	// Must match LOGIN_CREDENTIALS_ERROR_MESSAGE in to-login-form-result.mapper.ts
	// ("Invalid credentials. Please try again.").
	invalidCredentials: /invalid credentials/i,
} as const satisfies Readonly<Record<string, RegExp>>;

export type SignupCreds = {
	readonly email: string;
	readonly password: string;
	readonly username: string;
};

export type LoginCreds = {
	readonly email: string;
	readonly password: string;
};

export interface TestUser {
	readonly email: string;
	readonly password: string;
	readonly role: UserRole;
	readonly timestamp: number;
	readonly username: string;
}
