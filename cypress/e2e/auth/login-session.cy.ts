import { SESSION_COOKIE_NAME } from "../../../src/lib/auth/constants";
import type { UserEntity } from "../../../src/lib/db/entities/user";
import type { CreateUserInput, UserCredentials } from "../../support/commands";

// Test user credentials
const TEST_USER_CREDENTIALS: UserCredentials = {
	email: "test-login-session@example.com",
	password: "TestPassword123!",
	username: "testloginsession",
};

const TEST_USER_DB: CreateUserInput = {
	...TEST_USER_CREDENTIALS,
	role: "user",
};

describe("loginSession command", () => {
	let createdUser: UserEntity | null = null; // Store created user for use in tests

	before(() => {
		// Delete and create user, then store the result for userId
		cy.deleteUser(TEST_USER_CREDENTIALS.email)
			.then(() => cy.createUser(TEST_USER_DB))
			.then((result) => {
				// result should be the created user entity
				createdUser = result as UserEntity;
			});
	});

	it("should access dashboard with a mock session cookie", () => {
		// Ensure user is created and has an id
		expect(createdUser, "User should be created").to.not.be.null;
		expect(createdUser?.id, "User should have an id").to.exist;

		// Use the real userId from the DB
		cy.setMockSessionCookie(createdUser?.id, "user");
		cy.visit("/dashboard");
		cy.contains("Dashboard").should("be.visible");
	});

	it("should log in and cache the session for the user", () => {
		cy.loginSession(TEST_USER_CREDENTIALS);

		cy.url().should("include", "/dashboard");

		cy.window().then((win) => {
			const session = win.localStorage.getItem(SESSION_COOKIE_NAME);
			expect(session, `Session key ${SESSION_COOKIE_NAME} should exist`).to
				.exist;
		});
	});

	it("should restore the cached session on subsequent tests", () => {
		cy.loginSession(TEST_USER_CREDENTIALS);

		cy.visit("/dashboard");
		cy.contains("Dashboard").should("be.visible");
	});
});
