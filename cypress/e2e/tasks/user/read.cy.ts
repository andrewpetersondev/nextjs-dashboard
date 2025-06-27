/// <reference types="cypress" />
/// <reference path="../../../cypress.d.ts" />

import type { UserEntity } from "../../../../src/lib/db/entities/user.ts";
import type { DbTaskResult } from "../../../support/types.ts";
import { _TEST_USER } from "../../__fixtures__/users.ts";

describe("Auth Commands", () => {
	context("Auth Commands via Tasks", () => {
		before(() => {
			return cy.ensureUserDeleted(_TEST_USER.email).then(() => {
				return cy.createUser({ ..._TEST_USER });
			});
		});

		after(() => {
			return cy.ensureUserDeleted(_TEST_USER.email);
		});

		it("should retrieve a test user via db:findUser", () => {
			return cy
				.task<DbTaskResult<UserEntity>>("db:createUser", _TEST_USER)
				.then(() => {
					return cy
						.task<DbTaskResult<UserEntity>>("db:findUser", _TEST_USER.email)
						.then((result) => {
							expect(result).to.have.property("success", true);
							expect(result).to.have.property("data");
							const foundUser = result.data as UserEntity;
							expect(foundUser.email).to.equal(_TEST_USER.email);
						});
				});
		});
	});
});
