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

	it("should create a test user via db:createUser", () => {
		return cy
			.task<DbTaskResult<UserEntity>>("db:createUser", _TEST_USER)
			.then((result) => {
				expect(result).to.have.property("success", true);
				expect(result).to.have.property("data");
				const createdUser = result.data as UserEntity;
				expect(createdUser.email).to.equal(_TEST_USER.email);
			});
	});
});
