// cypress/e2e/auth/login-session.cy.ts

/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

import { SESSION_COOKIE_NAME } from "../../../src/lib/auth/constants";
import { TEST_USER_CREDENTIALS, TEST_USER_DB } from "../../support/types";

// Use constants for selectors and routes
const DASHBOARD_ROUTE = "/dashboard";
const DASHBOARD_TEXT = "Dashboard";

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

describe("loginSession command", () => {
	before(() => {
		// Ensure a clean user before all tests (not before each)
		cy.ensureUserDeleted(TEST_USER.email).then(() => {
			cy.createUser({ ...TEST_USER });
		});
	});

	after(() => {
		// Clean up after all tests
		cy.ensureUserDeleted(TEST_USER.email);
	});

	// Optionally clear cookies/localStorage before each test for isolation
	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();
	});

	it("should access dashboard with a mock session cookie", () => {
		cy.findUser(TEST_USER_DB.email).then((user) => {
			expect(user?.id, "User should have an id").to.exist;
			cy.setMockSessionCookie(user.id, "user");
			cy.visit(DASHBOARD_ROUTE);
			cy.contains(DASHBOARD_TEXT).should("be.visible");
		});
	});

	it("should log in and cache the session for the user", () => {
		cy.loginSession(TEST_USER_DB);
		cy.visit(DASHBOARD_ROUTE);
		cy.url().should("include", DASHBOARD_ROUTE);
		cy.getCookie(SESSION_COOKIE_NAME).should("exist");
	});

	it("should restore the cached session on subsequent tests", () => {
		cy.loginSession(TEST_USER_DB);
		cy.visit(DASHBOARD_ROUTE);
		cy.contains(DASHBOARD_TEXT).should("be.visible");
		cy.getCookie(SESSION_COOKIE_NAME).should("exist");
	});
});
