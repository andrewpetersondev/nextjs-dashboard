/**
 * Maximum email length, matching the `varchar(255)` `users.email` column.
 *
 * Consumed only by `email.schema.ts`; import that schema rather than validating
 * against these constants yourself.
 */
export const EMAIL_MAX_LENGTH = 255;

/** Shown when {@link EMAIL_MAX_LENGTH} is exceeded. */
export const EMAIL_MAX_LENGTH_ERROR =
	"Email must be at most 255 characters long.";

/** Catch-all message for an email failure with no more specific cause. */
export const EMAIL_ERROR = "Email had some sort of error. Please try again.";
