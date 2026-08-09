/**
 * Every role a user may hold.
 *
 * Ordered alphabetically, not by privilege — nothing derives authority from the
 * position of an entry, so this array must not be treated as a hierarchy.
 */
export const USER_ROLES = ["ADMIN", "GUEST", "USER"] as const;

/** Union of {@link USER_ROLES}, so adding an entry widens this automatically. */
export type UserRole = (typeof USER_ROLES)[number];

/** Full access, including the Users section of the dashboard. */
export const ADMIN_ROLE: UserRole = "ADMIN";

/** The fallback role: `user-role.parser.ts` returns this when parsing fails. */
export const GUEST_ROLE: UserRole = "GUEST";

/** The ordinary signed-in role. */
export const USER_ROLE: UserRole = "USER";
