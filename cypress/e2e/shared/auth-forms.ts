export const E2E_ID_MODULUS = 99_999_999 as const;

export const INVALID_EMAIL: string = "invalid@example.com";
export const INVALID_PASSWORD: string = "wrongpassword";

export const ERROR_MESSAGES = {
  FAILED_AUTH_FORM: /Failed to validate form data/i,
  INVALID_CREDENTIALS: /Invalid email or password/i,
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
  readonly timestamp: number;
  readonly username: string;
}
