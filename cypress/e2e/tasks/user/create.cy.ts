import type { UserEntity } from "../../../../src/lib/db/entities/user.ts";
import type { DbTaskResult } from "../../../support/types.ts";
import { _TEST_USER } from "../../__fixtures__/users.ts";

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
