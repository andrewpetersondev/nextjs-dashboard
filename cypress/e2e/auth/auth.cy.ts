/// <reference types="cypress" />
/// <reference path="../../../cypress.d.ts" />

import type { DbTaskResult } from "@/cypress/support/types";
import type { UserEntity } from "@/src/lib/db/entities/user";

describe("Auth Commands via UI", () => {
	beforeEach(() => {
		return cy.fixture("user").then((user) => {
			return cy.ensureUserDeleted(user.email);
		});
	});

	it("should signup a new user with custom command", () => {
		return cy.fixture("user").then((user) => {
			return cy.signup(user);
		});
	});

	it("should log in with created user with custom command", () => {
		return cy.fixture("user").then((user) => {
			return cy.login(user);
		});
	});
});

describe("Auth Commands via Tasks", () => {
	beforeEach(() => {
		return cy.fixture("user").then((user) => {
			return cy.ensureUserDeleted(user.email);
		});
	});

	it("should create a test user via db:createUser", () => {
		return cy.fixture("user").then((user) => {
			return cy
				.task<DbTaskResult<UserEntity>>("db:createUser", user)
				.then((result) => {
					expect(result).to.have.property("success", true);
					expect(result).to.have.property("data");
					const createdUser = result.data as UserEntity;
					expect(createdUser.email).to.equal(user.email);
				});
		});
	});

	it("should retrieve a test user via db:findUser", () => {
		return cy.fixture("user").then((user) => {
			return cy
				.task<DbTaskResult<UserEntity>>("db:createUser", user)
				.then(() => {
					return cy
						.task<DbTaskResult<UserEntity>>("db:findUser", user.email)
						.then((result) => {
							expect(result).to.have.property("success", true);
							expect(result).to.have.property("data");
							const foundUser = result.data as UserEntity;
							expect(foundUser.email).to.equal(user.email);
						});
				});
		});
	});

	it("should delete a test user via db:deleteUser", () => {
		return cy.fixture("user").then((user) => {
			return cy.ensureUserDeleted(user.email).then(() => {
				return cy
					.task<DbTaskResult<UserEntity>>("db:createUser", user)
					.then(() => {
						return cy
							.task<DbTaskResult<UserEntity>>("db:deleteUser", user.email)
							.then((result) => {
								expect(result).to.have.property("success", true);
								expect(result).to.have.property("data");
								const deletedUser = result.data as UserEntity;
								expect(deletedUser.email).to.equal(user.email);
							});
					});
			});
		});
	});
});
