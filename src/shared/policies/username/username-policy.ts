/**
 * Shortest accepted username.
 *
 * Consumed only by `username.schema.ts`; import that schema rather than
 * validating against these constants yourself.
 */
export const USERNAME_MIN_LENGTH = 3;

/** Shown when {@link USERNAME_MIN_LENGTH} is not met. */
export const USERNAME_MIN_LENGTH_ERROR =
	"Username must be at least 3 characters long.";

/**
 * Longest accepted username — well inside the `varchar(50)` `users.username`
 * column, so this is a product rule rather than a storage limit.
 */
export const USERNAME_MAX_LENGTH = 20;

/** Shown when {@link USERNAME_MAX_LENGTH} is exceeded. */
export const USERNAME_MAX_LENGTH_ERROR =
	"Username must be at most 20 characters long.";
