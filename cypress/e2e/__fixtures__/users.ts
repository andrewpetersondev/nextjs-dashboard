import type { CreateUserInput } from "../../support/types.ts";

export const _TEST_USER: CreateUserInput = {
	email: "testuser@example.com",
	password: "TestPassword123!",
	role: "user",
	username: "testuser",
};

export const _ADMIN_USER: CreateUserInput = {
	email: "admin@example.com",
	password: "AdminPassword123!",
	role: "admin",
	username: "adminuser",
};
