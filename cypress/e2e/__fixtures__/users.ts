// cypress/e2e/__fixtures__/users.ts

import type { CreateUserInput } from "../../support/types";

/**
 * Standard test user for E2E flows.
 */
export const TEST_USER: CreateUserInput = {
	email: "testuser@example.com",
	password: "TestPassword123!",
	role: "user",
	username: "testuser",
};

/**
 * Admin user for privileged flows.
 */
export const ADMIN_USER: CreateUserInput = {
	email: "admin@example.com",
	password: "AdminPassword123!",
	role: "admin",
	username: "adminuser",
};
