/**
 * A new account's details, on their way from a Server Action to the use case.
 *
 * Shape only — the length and character rules live in `shared/policies` and are
 * applied by the form schema before a command is built. `password` is plaintext;
 * never log or serialise one of these.
 */
export type SignupCommand = Readonly<{
	email: string;
	password: string;
	username: string;
}>;
