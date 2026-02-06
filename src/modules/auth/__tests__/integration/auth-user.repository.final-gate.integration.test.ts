import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthUserCreateDto } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-create.dto";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/auth-user/repositories/auth-user.repository";
import { getAppDb } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Integration test to prove the “final gate” validation is enforced at the
 * repository → DAL boundary, even when the DB is available.
 */
describe("AuthUserRepository final-gate integration", () => {
  const INVALID_EMAIL = "missing-at-symbol";
  const TEST_USERNAME = "finalgate";

  afterEach(async () => {
    const db = getAppDb();
    await db.delete(users).where(eq(users.email, INVALID_EMAIL));
  });

  it("should return a validation Err and not insert a user row when signup payload is invalid", async () => {
    const db = getAppDb();
    const repo = new AuthUserRepository(db, logger, "test-request-id");

    const invalidInput: AuthUserCreateDto = {
      email: INVALID_EMAIL,
      // @ts-expect-error repository expects pre-hashed password
      password: "password",
      role: "USER",
      username: TEST_USERNAME,
    };

    const result = await repo.signup(invalidInput);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.key).toBe("validation");
    }

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, INVALID_EMAIL))
      .limit(1);

    expect(row).toBeUndefined();
  });
});
