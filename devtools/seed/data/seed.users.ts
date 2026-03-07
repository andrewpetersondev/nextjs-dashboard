import {
	ADMIN_ROLE,
	GUEST_ROLE,
	USER_ROLE,
	type UserRole,
} from "@/shared/policies/user-role/user-role.constants";

/**
 * Seed roles used for demo users.
 */
export const roles = ["ADMIN", "GUEST", "USER"] as const;

/**
 * Plain demo user seed input data before password hashing.
 */
export const seedUsers: ReadonlyArray<{
	readonly email: string;
	readonly password: string;
	readonly role: UserRole;
	readonly username: string;
}> = [
	{
		email: "user@user.com",
		password: "UserPassword123!",
		role: USER_ROLE,
		username: "user",
	},
	{
		email: "admin@admin.com",
		password: "AdminPassword123!",
		role: ADMIN_ROLE,
		username: "admin",
	},
	{
		email: "guest@guest.com",
		password: "GuestPassword123!",
		role: GUEST_ROLE,
		username: "guest",
	},
] as const;
