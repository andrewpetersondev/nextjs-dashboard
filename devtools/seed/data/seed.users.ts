import { ADMIN_ROLE, GUEST_ROLE, USER_ROLE, type UserRole } from "@database";
import type { SeedUserInput } from "@devtools/seed/data/seed.types";

/**
 * Seed roles used for demo users.
 */
export const roles: ReadonlyArray<UserRole> = [
	ADMIN_ROLE,
	GUEST_ROLE,
	USER_ROLE,
];

/**
 * Plain demo user seed input data before password hashing.
 */
export const seedUserInputs: ReadonlyArray<SeedUserInput> = [
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
