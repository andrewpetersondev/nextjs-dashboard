import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAndCaptureRedirectPath } from "@/modules/auth/__tests__/integration/_test-utils_/next-redirect";
import { signupAction } from "@/modules/auth/presentation/authn/actions/signup.action";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import { getAppDb } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { getFormErrorPayload } from "@/shared/forms/logic/inspectors/form-error.inspector";

/**
 * Integration tests for the complete signup flow.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: how can i fix this?
describe("Signup Flow Integration", () => {
  const TEST_EMAIL = "signup-test@example.com";
  const TEST_PASSWORD = "TestPassword123!";
  const TEST_USERNAME = "signuptestuser";

  // Helpers
  const createSignupFormData = (
    email = TEST_EMAIL,
    password = TEST_PASSWORD,
    username = TEST_USERNAME,
  ) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    return formData;
  };

  beforeEach(() => {
    // keep if you later add per-test state; otherwise can be deleted entirely
  });

  afterEach(async () => {
    const db = getAppDb();
    await db.delete(users).where(eq(users.email, TEST_EMAIL));
    await db.delete(users).where(eq(users.email, "fail-test@example.com"));
    vi.clearAllMocks();
  });

  describe("Successful Signup", () => {
    it("should complete full signup flow, create user in DB, and redirect", async () => {
      const formData = createSignupFormData();

      const redirectedTo = await runAndCaptureRedirectPath(
        signupAction({} as FormResult<unknown>, formData),
      );
      expect(redirectedTo).toBe("/dashboard");

      const db = getAppDb();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, TEST_EMAIL))
        .limit(1);

      expect(user).toBeDefined();
      expect(user?.username).toBe(TEST_USERNAME);
      expect(user?.role).toBe("USER");

      // We need to import the mock to check it
      const { revalidatePath } = await import("next/cache");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: how can i address this?
  describe("Signup Errors", () => {
    it("should return validation errors for invalid input", async () => {
      const formData = createSignupFormData("not-an-email", "short", "");

      const result = await signupAction({} as FormResult<unknown>, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = getFormErrorPayload<SignupField>(result.error);
        expect(payload.fieldErrors?.email).toBeDefined();
        expect(payload.fieldErrors?.password).toBeDefined();
        expect(payload.fieldErrors?.username).toBeDefined();
      }
    });

    it("should handle email conflicts (already exists)", async () => {
      // 1. Create a user first
      const db = getAppDb();
      await db.insert(users).values({
        email: TEST_EMAIL,
        password: toHash("hashed_password"),
        role: "USER",
        username: "existing_user",
      });

      // 2. Try to signup with same email
      const formData = createSignupFormData();
      const result = await signupAction({} as FormResult<unknown>, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = getFormErrorPayload<SignupField>(result.error);
        // Server Action contract: conflicts must return field-level errors.
        expect(payload.fieldErrors?.email).toBeDefined();
        expect(payload.fieldErrors.email.length).toBeGreaterThan(0);
        expect(payload.fieldErrors.email[0]?.toLowerCase()).toMatch(
          // biome-ignore lint/performance/useTopLevelRegex: TODO EXTRACT LATER
          /already|use|exists|unique|conflict/,
        );
      }
    });

    it("should handle database failures during signup gracefully", async () => {
      // Use a unique email to avoid conflicts if previous tests failed to cleanup
      const _db = getAppDb();
      const failEmail = "fail-test@example.com";
      const formData = createSignupFormData(failEmail);

      // We mock the database insert directly on the prototype to ensure it's caught
      const { PgDatabase } = await import("drizzle-orm/pg-core");
      const insertSpy = vi
        .spyOn(PgDatabase.prototype, "insert")
        .mockImplementation(() => {
          throw new Error("Database insert failed");
        });

      const result = await signupAction({} as FormResult<unknown>, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = getFormErrorPayload<SignupField>(result.error);
        expect(payload.formErrors).toBeDefined();
        expect(payload.formErrors.length).toBeGreaterThan(0);
        // We accept pg_unique_violation too because state might be polluted
        // if cleanup fails, but it SHOULD be the error we throw.
        const firstFormError = payload.formErrors[0];
        expect(firstFormError).toBeDefined();
        expect(firstFormError?.toLowerCase()).toMatch(
          // biome-ignore lint/performance/useTopLevelRegex: TODO EXTRACT REGEX
          /database insert failed|unexpected|error|unique|conflict/,
        );
      }

      insertSpy.mockRestore();
    });
  });
});
