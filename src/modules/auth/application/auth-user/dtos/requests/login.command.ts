/**
 * Credentials as submitted, on their way from a Server Action to the use case.
 *
 * `password` is plaintext here — this is the last layer that sees it before
 * hashing, so never log, serialise, or attach one of these to an error.
 */
export type LoginCommand = Readonly<{
	email: string;
	password: string;
}>;
