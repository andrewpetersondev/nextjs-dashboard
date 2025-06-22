import { SESSION_COOKIE_NAME } from "../../../src/lib/auth/constants";
import type { UserEntity } from "../../../src/lib/db/entities/user";
import { TEST_USER_CREDENTIALS, TEST_USER_DB } from "../../support/types";

describe("loginSession command", () => {
	let createdUser: UserEntity | null = null; // Store created user for use in tests

	before(() => {
		cy.deleteUser(TEST_USER_CREDENTIALS.email)
			.then(() => cy.createUser(TEST_USER_DB))
			.then((result) => {
				createdUser = result as UserEntity;
			});
	});

	it("should access dashboard with a mock session cookie", () => {
		expect(createdUser?.id, "User should have an id").to.exist;
		cy.setMockSessionCookie(createdUser!.id, "user");
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
