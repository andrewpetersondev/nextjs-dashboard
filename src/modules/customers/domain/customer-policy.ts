/**
 * Field policy for customer writes.
 *
 * Kept beside the schema rather than in `@/shared/policies/` because these
 * bounds are this module's own: a customer name is a display label for a
 * business contact, unlike `username`, which is an account identity shared by
 * the auth and users modules.
 *
 * The max lengths mirror `varchar(255)` on the `customers` table — validating
 * here turns what would be a Postgres error into a field-level form message.
 */

const WHITESPACE_RUN_GLOBAL = /\s+/gu;

export const CUSTOMER_NAME_MIN_LENGTH = 2;
export const CUSTOMER_NAME_MAX_LENGTH = 255;

export const CUSTOMER_NAME_MIN_LENGTH_ERROR = `Name must be at least ${CUSTOMER_NAME_MIN_LENGTH} characters.`;
export const CUSTOMER_NAME_MAX_LENGTH_ERROR = `Name must be at most ${CUSTOMER_NAME_MAX_LENGTH} characters.`;

/**
 * Collapses runs of whitespace and trims — so "  Amy   Burns " becomes
 * "Amy Burns". Applied before length checks so a name of only spaces fails the
 * minimum rather than being stored blank.
 */
export function normalizeCustomerName(value: string): string {
	return value.trim().replace(WHITESPACE_RUN_GLOBAL, " ");
}

/**
 * Stored in `customers.image_url` when a customer has no avatar file.
 *
 * The column is `NOT NULL`, and `next/image` has no `remotePatterns`
 * configured, so an arbitrary URL cannot be rendered. The empty string is the
 * explicit "no image" marker that `CustomerAvatar` turns into initials.
 */
export const CUSTOMER_IMAGE_URL_NONE = "";
