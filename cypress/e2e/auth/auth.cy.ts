/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

import type { UserEntity } from "../../../src/db/entities/user";
import type { DbTaskResult } from "../../tasks/db-tasks";

describe("Auth Commands via UI", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			// Use DB task for fast, reliable cleanup
			cy.task("db:deleteUser", user.email);
		});
	});

	afterEach(() => {
		cy.fixture("user").then((user) => {
			cy.task("db:deleteUser", user.email);
		});
	});

	it("should signup a new user with custom command", () => {
		cy.fixture("user").then((user) => {
			cy.signup(user);
		});
	});

	it("should log in with created user with custom command", () => {
		cy.fixture("user").then((user) => {
			// Ensure user exists in DB before UI login
			cy.task("db:createUser", user);
			cy.login(user);
		});
	});
});

describe("Auth Commands via Tasks", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			cy.task("db:deleteUser", user.email);
		});
	});

	afterEach(() => {
		cy.fixture("user").then((user) => {
			cy.task("db:deleteUser", user.email);
		});
	});

	it("should create a test user via db:createUser", () => {
		cy.fixture("user").then((user) => {
			cy.task("db:createUser", user).then((result) => {
				const dbResult = result as DbTaskResult<UserEntity>;
				expect(dbResult.success).to.be.true;
			});
		});
	});

	it("should retrieve a test user via db:findUser", () => {
		cy.fixture("user").then((user) => {
			cy.task("db:createUser", user);
			cy.task("db:findUser", user.email).then((result) => {
				const dbResult = result as DbTaskResult<UserEntity>;
				expect(dbResult.success).to.be.true;
				expect(dbResult.data).to.have.property("email", user.email);
			});
		});
	});

	it("should delete a test user via db:deleteUser", () => {
		cy.fixture("user").then((user) => {
			cy.task("db:createUser", user);
			cy.task("db:deleteUser", user.email).then((result) => {
				const dbResult = result as DbTaskResult<UserEntity>;
				expect(dbResult.success).to.be.true;
			});
		});
	});
});
