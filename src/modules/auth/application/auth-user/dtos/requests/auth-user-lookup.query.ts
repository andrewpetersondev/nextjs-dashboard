/**
 * Looks a user up by email — the identifier both login and signup key on.
 *
 * A query, not a command: it must not change anything, which is why the login
 * path can reuse it to test for an existing account.
 */
export interface AuthUserLookupQuery {
	readonly email: string;
}
