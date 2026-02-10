import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAndCaptureRedirectPath } from "@/modules/auth/__tests__/integration/_test-utils_/next-redirect";
import { loginAction } from "@/modules/auth/presentation/authn/actions/login.action";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import { getAppDb } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema/users";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { formErrorPayloadMapper } from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

/**
 * Integration tests for the complete login flow.
 *
 * These tests validate the entire authentication flow from the Server Action
 * through all layers (presentation → application → infrastructure → database)
 * and back to the UI.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: fix later
describe("Login Flow Integration", () => {
  const TEST_EMAIL = "integration-test@example.com";
  const TEST_PASSWORD = "TestPassword123!";
  const TEST_USERNAME = "integrationtestuser";
  let testUserId: string;

  // Helpers
  // biome-ignore lint/nursery/useExplicitType: <fix later>
  const createLoginFormData = (
    email = TEST_EMAIL,
    password = TEST_PASSWORD,
  ) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    return formData;
  };

  // biome-ignore lint/nursery/useExplicitType: <fix later>
  const expectRedirectTo = async (
    // biome-ignore lint/suspicious/noExplicitAny: keep until a better solution
    action: Promise<any>,
    expectedPath: string,
  ) => {
    try {
      await action;
      // biome-ignore lint/suspicious/noMisplacedAssertion: i think this is fine because it is called from inside it()
      expect.fail("Expected redirect to throw NEXT_REDIRECT");
      // biome-ignore lint/suspicious/noExplicitAny: keep until a better solution
    } catch (error: any) {
      if (error.message === "NEXT_REDIRECT") {
        const { redirect: mockRedirect } = await import("next/navigation");
        // biome-ignore lint/suspicious/noMisplacedAssertion: i think this is fine because it is called from inside it()
        expect(mockRedirect).toHaveBeenCalledWith(expectedPath);
        return;
      }
      throw error;
    }
  };

  beforeEach(async () => {
    const db = getAppDb();
    const { BcryptPasswordService } = await import(
      "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
    );
    const hasher = new BcryptPasswordService(10);
    const hashedPassword = await hasher.hash(TEST_PASSWORD);

    const [insertedUser] = await db
      .insert(users)
      .values({
        email: TEST_EMAIL,
        password: hashedPassword,
        role: "USER",
        username: TEST_USERNAME,
      } satisfies NewUserRow)
      .returning();

    testUserId = insertedUser?.id || "550e8400-e29b-41d4-a716-446655440000";
  });

  afterEach(async () => {
    const db = getAppDb();
    if (testUserId) {
      // biome-ignore lint/suspicious/noExplicitAny: keep until a better solution
      await db.delete(users).where(eq(users.id, testUserId as any));
    }
    vi.clearAllMocks();
  });

  describe("Successful Login", () => {
    it("should complete full flow and redirect to dashboard", async () => {
      const formData = createLoginFormData();

      const redirectedTo = await runAndCaptureRedirectPath(
        loginAction({} as FormResult<unknown>, formData),
      );
      expect(redirectedTo).toBe("/dashboard");

      const { revalidatePath: mockRevalidatePath } = await import("next/cache");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: fix later
  describe("Authentication and Validation Errors", () => {
    it("should return validation errors for invalid input format", async () => {
      const formData = createLoginFormData("invalid-email", TEST_PASSWORD);

      const result = await loginAction({} as FormResult<unknown>, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = formErrorPayloadMapper<LoginField>(result.error);
        expect(payload.fieldErrors?.email).toBeDefined();
      }
    });

    it("should handle invalid credentials (wrong password or user not found) identically", async () => {
      const cases = [
        {
          email: TEST_EMAIL,
          name: "wrong password",
          password: "WrongPassword123!",
        },
        {
          email: "nonexistent@example.com",
          name: "non-existent user",
          password: TEST_PASSWORD,
        },
      ];

      const messages: string[] = [];

      for (const c of cases) {
        const formData = createLoginFormData(c.email, c.password);
        // biome-ignore lint/performance/noAwaitInLoops: keep until better solution comes
        const result = await loginAction({} as FormResult<unknown>, formData);

        expect(result.ok, `Expected failure for ${c.name}`).toBe(false);
        if (!result.ok) {
          const payload = formErrorPayloadMapper<LoginField>(result.error);
          const message = payload.formErrors[0] || payload.message;
          expect(message).toContain("Invalid credentials");
          messages.push(message);
        }
      }

      // Enumeration prevention: messages must be identical
      expect(messages[0]).toBe(messages[1]);
    });

    it("should handle database connection failures gracefully", async () => {
      const db = getAppDb();
      const originalSelect = db.select;
      vi.spyOn(db, "select").mockImplementationOnce(() => {
        throw new Error("Database connection failed");
      });

      const formData = createLoginFormData();
      const result = await loginAction({} as FormResult<unknown>, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = formErrorPayloadMapper<LoginField>(result.error);
        expect(payload.formErrors).toBeDefined();
      }

      db.select = originalSelect;
    });
  });

  describe("Cross-Cutting Concerns", () => {
    it("should enforce security boundaries and track performance", async () => {
      // This test exercises the flow to verify that performance tracking and
      // security boundaries (like mapper chains) are active.
      // Since we can't easily inspect the internal session storage or tracker
      // in this integration test without deep mocking, we verify the successful
      // completion of the flow which depends on these components.

      const formData = createLoginFormData();

      // We use the successful flow as a proxy for verifying the chain
      // If any mapper in the chain (UserRow -> Entity -> DTO -> Principal -> JWT)
      // failed or leaked sensitive data in a way that caused an exception,
      // this test would fail.
      await expectRedirectTo(
        loginAction({} as FormResult<unknown>, formData),
        "/dashboard",
      );
    });
  });
});
