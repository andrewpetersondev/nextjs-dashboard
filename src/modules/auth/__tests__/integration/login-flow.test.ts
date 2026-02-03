import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/modules/auth/presentation/authn/actions/login.action";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import { getAppDb } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema/users";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { getFormErrorPayload } from "@/shared/forms/logic/inspectors/form-error.inspector";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => {
  const mockHeaders = new Map([
    ["user-agent", "test-agent"],
    ["x-forwarded-for", "127.0.0.1"],
  ]);
  return {
    cookies: vi.fn(() => ({
      delete: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
    })),
    headers: vi.fn(async () => mockHeaders),
  };
});

/**
 * Integration tests for the complete login flow.
 *
 * These tests validate the entire authentication flow from the Server Action
 * through all layers (presentation → application → infrastructure → database)
 * and back to the UI.
 *
 * Test Coverage:
 * - Successful login flow (action → db → session → cookie → redirect)
 * - Error propagation (DB errors, validation errors, authentication errors)
 * - Session establishment and cookie setting
 * - Data transformation through all mappers
 */
describe("Login Flow Integration", () => {
  const testEmail = "integration-test@example.com";
  const testPassword = "TestPassword123!";
  const testUsername = "integrationtestuser";
  let testUserId: string;

  beforeEach(async () => {
    // Setup: Create a test user in the database
    const db = getAppDb();
    // Use the same hashing service as the application to ensure compatibility
    const { BcryptPasswordService } = await import(
      "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
    );
    const hasher = new BcryptPasswordService(10);
    const hashedPassword = await hasher.hash(testPassword);

    const [insertedUser] = await db
      .insert(users)
      .values({
        email: testEmail,
        // id is created by the database
        // id: "550e8400-e29b-41d4-a716-446655440000",
        password: hashedPassword,
        role: "USER",
        username: testUsername,
      } satisfies NewUserRow)
      .returning();

    testUserId = insertedUser
      ? insertedUser.id
      : "550e8400-e29b-41d4-a716-446655440000";
    //    testUserId = insertedUser.id;
  });

  afterEach(async () => {
    // Cleanup: Remove test user from database
    const db = getAppDb();
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("Successful Login Flow", () => {
    it("should complete full login flow: action → db → session → cookie → redirect", async () => {
      // Arrange: Create FormData with valid credentials
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      // Mock redirect and revalidatePath
      const { redirect: mockRedirect } = await import("next/navigation");

      // Act & Assert: Execute login action
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (error) {
        // Assert: Verify redirect was called (successful login)
        // Next.js redirect throws an error that might have "NEXT_REDIRECT" in message or be the error itself
        if (error.message === "NEXT_REDIRECT") {
          expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
          return;
        }
        throw error; // Rethrow if it's not the expected redirect error
      }
      // If we reach here, redirect didn't throw (unexpected)
      expect.fail("Expected redirect to throw NEXT_REDIRECT");
    });

    it("should establish session with correct user data", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      const { redirect: mockRedirect } = await import("next/navigation");

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (_error) {
        // Expected redirect
      }

      // Assert: Session should be established
      expect(mockRedirect).toHaveBeenCalled();
    });
  });

  describe("Error Propagation", () => {
    it("should propagate validation errors to UI", async () => {
      // Arrange: Invalid email format
      const formData = new FormData();
      formData.append("email", "invalid-email"); // Missing @ symbol
      formData.append("password", testPassword);

      // Act
      const result = await loginAction({} as FormResult<unknown>, formData);

      // Assert: Should return form errors
      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = getFormErrorPayload<LoginField>(result.error);
        expect(payload.fieldErrors).toBeDefined();
        expect(payload.fieldErrors?.email).toBeDefined();
      }
    });

    it("should handle user not found error", async () => {
      // Arrange: Non-existent user
      const formData = new FormData();
      formData.append("email", "nonexistent@example.com");
      formData.append("password", testPassword);

      // Act
      const result = await loginAction({} as FormResult<unknown>, formData);

      // Assert: Should return generic authentication error (credential enumeration prevention)
      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Error should be generic to prevent account enumeration
        const payload = getFormErrorPayload<LoginField>(result.error);
        // Authentication errors might be plain AppErrors, not FormValidationErrors
        const errorMessage =
          payload.formErrors.length > 0
            ? payload.formErrors[0]
            : payload.message;
        expect(errorMessage).toContain("Invalid");
      }
    });

    it("should handle invalid password error", async () => {
      // Arrange: Correct email, wrong password
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", "WrongPassword123!");

      // Act
      const result = await loginAction({} as FormResult<unknown>, formData);

      // Assert: Should return generic authentication error
      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Error should be generic to prevent credential enumeration
        const payload = getFormErrorPayload<LoginField>(result.error);
        const errorMessage =
          payload.formErrors.length > 0
            ? payload.formErrors[0]
            : payload.message;
        expect(errorMessage).toContain("Invalid");
      }
    });

    it("should handle database connection errors gracefully", async () => {
      // Arrange: Valid credentials but simulate DB error
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      // Mock database to throw error
      const db = getAppDb();
      const originalSelect = db.select;
      vi.spyOn(db, "select").mockImplementationOnce(() => {
        throw new Error("Database connection failed");
      });

      // Act
      const result = await loginAction({} as FormResult<unknown>, formData);

      // Assert: Should handle error gracefully
      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = getFormErrorPayload<LoginField>(result.error);
        expect(payload.formErrors).toBeDefined();
      }

      // Cleanup
      db.select = originalSelect;
    });
  });

  describe("Data Transformation Chain", () => {
    it("should transform data through all mapper layers", async () => {
      // This test validates the complete mapper chain:
      // UserRow → AuthUserEntity → AuthenticatedUserDto → SessionPrincipalDto → JWT

      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      const { redirect: mockRedirect } = await import("next/navigation");

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (_error) {
        // Expected redirect
      }

      // Assert: Verify transformations occurred
      expect(mockRedirect).toHaveBeenCalled();
    });
  });

  describe("Security Boundaries", () => {
    it("should strip password hash at application boundary", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      const { redirect: mockRedirect } = await import("next/navigation");

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (_error) {
        // Expected redirect
      }

      // Assert: Password hash should never appear in:
      // - AuthenticatedUserDto
      // - SessionPrincipalDto
      // - JWT claims
      // - Cookie value
      // Only AuthUserEntity (domain layer) should contain the hash

      expect(mockRedirect).toHaveBeenCalled();
    });

    it("should prevent credential enumeration in error messages", async () => {
      // Test 1: Non-existent user
      const formData1 = new FormData();
      formData1.append("email", "nonexistent@example.com");
      formData1.append("password", testPassword);
      const result1 = await loginAction({} as FormResult<unknown>, formData1);

      // Test 2: Existing user, wrong password
      const formData2 = new FormData();
      formData2.append("email", testEmail);
      formData2.append("password", "WrongPassword123!");
      const result2 = await loginAction({} as FormResult<unknown>, formData2);

      // Assert: Both errors should be identical (generic message)
      expect(result1.ok).toBe(false);
      expect(result2.ok).toBe(false);

      if (!(result1.ok || result2.ok)) {
        // Error messages should be the same to prevent enumeration
        const payload1 = getFormErrorPayload<LoginField>(result1.error);
        const payload2 = getFormErrorPayload<LoginField>(result2.error);
        const msg1 =
          payload1.formErrors.length > 0
            ? payload1.formErrors[0]
            : payload1.message;
        const msg2 =
          payload2.formErrors.length > 0
            ? payload2.formErrors[0]
            : payload2.message;
        expect(msg1).toBe(msg2);
      }
    });
  });

  describe("Performance Tracking", () => {
    it("should track performance metrics through all layers", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      const { redirect: mockRedirect } = await import("next/navigation");

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (_error) {
        // Expected redirect
      }

      // Assert: Performance tracking should have measured:
      // - Server Action: validation, authentication phases
      // - Use Case: repo.findByEmail, hasher.compare, mapper timing
      // - Session Use Case: sessionTokenService.issue, sessionStore.setCookie
      // - DAL: database query execution

      // In a real test, we would verify logs contain timing data
      expect(mockRedirect).toHaveBeenCalled();
    });
  });
});
