import type { UserEntity } from "@/db/models/user.entity.ts";
import type { DbTaskResult } from "../../support/types.ts";
import { _TEST_USER } from "../__fixtures__/users.ts";

const UPDATED_USERNAME = "Updated Test User";
const UPDATED_ROLE = "admin";

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

    it("should update a user via db:updateUser and return the updated user", () => {
      // Arrange: define updates
      const updates: Partial<UserEntity> = {
        role: UPDATED_ROLE as UserEntity["role"],
        username: UPDATED_USERNAME,
      };

      // Act: call the update task
      return cy
        .task<DbTaskResult<UserEntity>>("db:updateUser", {
          email: _TEST_USER.email,
          updates,
        })
        .then((result) => {
          // Assert: check task result
          expect(result).to.have.property("success", true);
          expect(result).to.have.property("data");
          const updatedUser = result.data as UserEntity;
          expect(updatedUser.email).to.equal(_TEST_USER.email);
          expect(updatedUser.username).to.equal(UPDATED_USERNAME);
          expect(updatedUser.role).to.equal(UPDATED_ROLE);
        });
    });

    it("should return an error if the user does not exist", () => {
      // Act: try to update a non-existent user
      return cy
        .task<DbTaskResult<UserEntity>>("db:updateUser", {
          email: "nonexistent@example.com",
          updates: { name: "Should Not Exist" },
        })
        .then((result) => {
          // Assert: check for error
          expect(result.success).to.be.false;
          expect(result.error).to.exist;
          expect(result.errorMessage).to.match(/could not be found/i);
        });
    });
  });
});
