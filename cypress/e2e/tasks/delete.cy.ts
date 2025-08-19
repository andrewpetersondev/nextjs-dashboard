import type { UserEntity } from "@/features/users/user.entity.ts";
import type { DbTaskResult } from "../../support/types.ts";
import { _TEST_USER } from "../__fixtures__/users.ts";

describe("Auth Commands", () => {
	before(() => {
		return cy.ensureUserDeleted(_TEST_USER.email);
	});

	after(() => {
		return cy.ensureUserDeleted(_TEST_USER.email);
	});

	it("should delete a test user via db:deleteUserDal", () => {
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
