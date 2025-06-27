/// <reference types="cypress" />
/// <reference path="../../../../cypress.d.ts" />

import type { UserEntity } from "../../../../src/lib/db/entities/user";
import type { DbTaskResult } from "../../../support/types";
import { _TEST_USER } from "../../__fixtures__/users";

describe("Auth Commands", () => {
	before(() => {
		return cy.ensureUserDeleted(_TEST_USER.email);
	});

	after(() => {
		return cy.ensureUserDeleted(_TEST_USER.email);
	});

	it("should delete a test user via db:deleteUser", () => {
		return cy.ensureUserDeleted(_TEST_USER.email).then(() => {
			return cy
				.task<DbTaskResult<UserEntity>>("db:createUser", _TEST_USER)
				.then(() => {
					return cy
						.task<DbTaskResult<UserEntity>>("db:deleteUser", _TEST_USER.email)
						.then((result) => {
							expect(result).to.have.property("success", true);
							expect(result).to.have.property("data");
							const deletedUser = result.data as UserEntity;
							expect(deletedUser.email).to.equal(_TEST_USER.email);
						});
				});
		});
	});
});
