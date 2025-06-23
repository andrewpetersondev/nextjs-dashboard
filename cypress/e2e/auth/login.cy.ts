/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

import { TEST_USER_CREDENTIALS } from "../../support/types";

// Define a complete test user for DB operations (omit role to use default)
const TEST_USER = {
	email: TEST_USER_CREDENTIALS.email,
	password: TEST_USER_CREDENTIALS.password,
	username: TEST_USER_CREDENTIALS.username, // Ensure this exists in your types
	// role: "user", // Optional, omitted to use DB default
};

const LOGIN_CREDENTIALS = {
	email: TEST_USER.email,
	password: TEST_USER.password,
};

// todo: remove async/await in cypress hooks. use cypress promise chaining instead

// describe("UI Login Tests @ /auth/login.cy.ts", () => {
// 	beforeEach(() => {
// 		cy.fixture("user").then(async (user) => {
// 			// Ensure user is deleted before test
// 			await cy.deleteUser(user.email);
// 			// Await user creation to avoid race conditions
// 			await cy.createUser(user);
// 		});
// 	});
//
// 	afterEach(() => {
// 		cy.fixture("user").then((user) => {
// 			cy.deleteUser(user.email);
// 		});
// 	});
//
// 	it("logs in successfully with valid credentials", () => {
// 		cy.fixture("user").then((user) => {
// 			cy.login(
// 				{ email: user.email, password: user.password },
// 				{ assertSuccess: true },
// 			);
// 			// Assert dashboard is visible with increased timeout
// 			cy.location("pathname", { timeout: 10000 }).should(
// 				"include",
// 				"/dashboard",
// 			);
// 			cy.contains("Dashboard", { timeout: 10000 }).should("be.visible");
// 		});
// 	});
//
// 	it("fails to log in with invalid password", () => {
// 		cy.fixture("user").then((user) => {
// 			cy.login({ email: user.email, password: "WrongPassword123!" });
// 			cy.get('[data-cy="login-message-errors"]', { timeout: 10000 }).should(
// 				"contain",
// 				"Invalid email or password",
// 			);
// 		});
// 	});
//
// 	it("fails to log in with invalid email", () => {
// 		cy.fixture("user").then((user) => {
// 			cy.login({ email: "invalidemail@mail.com", password: user.password });
// 			cy.get('[data-cy="login-message-errors"]', { timeout: 10000 }).should(
// 				"contain",
// 				"Invalid email or password",
// 			);
// 		});
// 	});
//
// 	it("fails to log in with non-existent email", () => {
// 		cy.fixture("user").then((user) => {
// 			cy.login({ email: "nonexistent@mail.com", password: user.password });
// 			cy.get('[data-cy="login-message-errors"]', { timeout: 10000 }).should(
// 				"contain",
// 				"Invalid email or password",
// 			);
// 		});
// 	});
// });
//
// describe("Login (loginNew command)", () => {
// 	beforeEach(() => {
// 		cy.fixture("user").then(async (user) => {
// 			await cy.deleteUser(user.email);
// 			await cy.createUser(user);
// 		});
// 	});
//
// 	it("logs in with valid credentials", () => {
// 		cy.fixture("user").then((user) => {
// 			cy.visit("/login");
// 			cy.loginNew(
// 				{ email: user.email, password: user.password },
// 				{ assertSuccess: true },
// 			);
// 			cy.location("pathname", { timeout: 10000 }).should(
// 				"include",
// 				"/dashboard",
// 			);
// 			cy.contains("Dashboard", { timeout: 10000 }).should("be.visible");
// 		});
// 	});
// });

describe("Login E2E", () => {
	beforeEach(() => {
		// Always return the Cypress chain for proper async handling
		// Chainable<undefined>.ensureUserDeleted(email: string): Cypress.Chainable<UserEntity | null>
		// Chainable<undefined>.createUser(user: CreateUserInput): Cypress.Chainable<UserEntity>
		return cy.ensureUserDeleted(TEST_USER.email).then(() => {
			return cy.createUser({ ...TEST_USER }); // username is required, role is optional
		});
	});

	afterEach(() => {
		return cy.ensureUserDeleted(TEST_USER.email);
	});

	it("should log in via the UI", () => {
		cy.login(LOGIN_CREDENTIALS);
		cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard");
		cy.get("h1").contains("Dashboard", { timeout: 10000 }).should("be.visible");
	});

	// it("should log in using loginNew command", () => {
	// 	cy.visit("/login");
	// 	cy.loginNew(LOGIN_CREDENTIALS, { assertSuccess: true });
	// 	cy.location("pathname", { timeout: 10000 }).should("include", "/dashboard");
	// 	cy.get("h1").contains("Dashboard", { timeout: 10000 }).should("be.visible");
	// });
});
