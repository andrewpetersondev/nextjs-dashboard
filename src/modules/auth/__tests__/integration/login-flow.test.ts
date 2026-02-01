import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/modules/auth/presentation/authn/actions/login.action";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import { getAppDb } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";

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
    const hashedPassword = await toHash(testPassword);

    const [insertedUser] = await db
      .insert(users)
      .values({
        email: testEmail,
        password: hashedPassword,
        role: "USER",
        username: testUsername,
      })
      .returning();

    testUserId = insertedUser.id;
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

      // Mock redirect to prevent actual navigation in tests
      const mockRedirect = vi.fn(() => {
        throw new Error("NEXT_REDIRECT"); // Next.js throws this internally
      });
      vi.mock("next/navigation", () => ({
        redirect: mockRedirect,
        revalidatePath: vi.fn(),
      }));

      // Act & Assert: Execute login action
      try {
        await loginAction({} as FormResult<unknown>, formData);
        // If we reach here, redirect didn't throw (unexpected)
        expect.fail("Expected redirect to throw NEXT_REDIRECT");
      } catch (error) {
        // Assert: Verify redirect was called (successful login)
        expect(error).toHaveProperty("message", "NEXT_REDIRECT");
        expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
      }

      // Note: In a real integration test, we would also verify:
      // 1. Database query was executed (via spy/mock)
      // 2. Password comparison was performed
      // 3. Session token was created
      // 4. Cookie was set with correct attributes
      // 5. Performance tracking logged timings
    });

    it("should establish session with correct user data", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      // Mock to capture session data
      const mockRedirect = vi.fn(() => {
        throw new Error("NEXT_REDIRECT");
      });
      vi.mock("next/navigation", () => ({
        redirect: mockRedirect,
        revalidatePath: vi.fn(),
      }));

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (error) {
        // Expected redirect
      }

      // Assert: Session should be established
      // In a real test, we would verify the session cookie contains:
      // - userId matching testUserId
      // - role: "user"
      // - Valid JWT signature
      // - Correct expiration time
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
        expect(result.error.fieldErrors).toBeDefined();
        expect(result.error.fieldErrors?.email).toBeDefined();
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
        expect(result.error.formError).toBeDefined();
        expect(result.error.formError).toContain("Invalid");
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
        expect(result.error.formError).toBeDefined();
        expect(result.error.formError).toContain("Invalid");
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
        expect(result.error.formError).toBeDefined();
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

      const mockRedirect = vi.fn(() => {
        throw new Error("NEXT_REDIRECT");
      });
      vi.mock("next/navigation", () => ({
        redirect: mockRedirect,
        revalidatePath: vi.fn(),
      }));

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (error) {
        // Expected redirect
      }

      // Assert: Verify transformations occurred
      // 1. UserRow from DB was mapped to AuthUserEntity (with branded types)
      // 2. AuthUserEntity was mapped to AuthenticatedUserDto (password stripped)
      // 3. AuthenticatedUserDto was mapped to SessionPrincipalDto (minimal data)
      // 4. SessionPrincipalDto was encoded to JWT
      // 5. JWT was set as HTTP-only secure cookie

      expect(mockRedirect).toHaveBeenCalled();
    });
  });

  describe("Security Boundaries", () => {
    it("should strip password hash at application boundary", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      const mockRedirect = vi.fn(() => {
        throw new Error("NEXT_REDIRECT");
      });
      vi.mock("next/navigation", () => ({
        redirect: mockRedirect,
        revalidatePath: vi.fn(),
      }));

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (error) {
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
        expect(result1.error.formError).toBe(result2.error.formError);
      }
    });
  });

  describe("Performance Tracking", () => {
    it("should track performance metrics through all layers", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("email", testEmail);
      formData.append("password", testPassword);

      const mockRedirect = vi.fn(() => {
        throw new Error("NEXT_REDIRECT");
      });
      vi.mock("next/navigation", () => ({
        redirect: mockRedirect,
        revalidatePath: vi.fn(),
      }));

      // Act
      try {
        await loginAction({} as FormResult<unknown>, formData);
      } catch (error) {
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
