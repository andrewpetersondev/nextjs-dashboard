import { describe, expect, it } from "vitest";
import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import {
  UPDATE_SESSION_OUTCOME_REASON,
  type UpdateSessionSuccessDto,
} from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import { toSessionPrincipal } from "@/modules/auth/application/shared/mappers/flows/login/to-session-principal.mapper";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Unit tests for toSessionPrincipal mapper.
 *
 * This mapper extracts minimal data (id, role) for JWT claims, implementing
 * the principle of least privilege for session tokens.
 *
 * Transformation: AuthenticatedUserDto | UpdateSessionSuccessDto → SessionPrincipalDto
 * Layer: Application → Application
 * Security: Minimal data for JWT claims (only id and role)
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <FIX LATER>
describe("toSessionPrincipal Mapper", () => {
  const TEST_USER_ID = toUserId("00000000-0000-0000-0000-000000000123");

  const createTestAuthUserDto = (
    overrides: Partial<AuthenticatedUserDto> = {},
  ): AuthenticatedUserDto => ({
    email: "test@example.com",
    id: TEST_USER_ID,
    role: "USER",
    username: "testuser",
    ...overrides,
  });

  const createTestUpdateSessionDto = (
    overrides: Partial<UpdateSessionSuccessDto> = {},
  ): UpdateSessionSuccessDto => ({
    expiresAtMs: 1_700_000_000_000,
    reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
    refreshed: true,
    role: "USER",
    userId: TEST_USER_ID,
    ...overrides,
  });

  describe("Security Boundary - Principle of Least Privilege", () => {
    it("should strictly include only id and role from AuthenticatedUserDto", () => {
      // Arrange
      const input = createTestAuthUserDto({
        email: "sensitive@example.com",
        username: "sensitive_user",
      });

      // Act
      const principal = toSessionPrincipal(input);

      // Assert
      expect(principal).toEqual({
        id: TEST_USER_ID,
        role: "USER",
      });

      // Explicit property checks
      expect(principal).not.toHaveProperty("email");
      expect(principal).not.toHaveProperty("username");

      // JSON serialization safety
      const json = JSON.stringify(principal);
      expect(json).not.toContain("sensitive@example.com");
      expect(json).not.toContain("sensitive_user");
    });

    it("should strictly include only id and role from UpdateSessionSuccessDto", () => {
      // Arrange
      const input = createTestUpdateSessionDto({
        expiresAtMs: 999_999,
        refreshed: true,
      });

      // Act
      const principal = toSessionPrincipal(input);

      // Assert
      expect(principal).toEqual({
        id: TEST_USER_ID,
        role: "USER",
      });

      // Property checks
      expect(principal).not.toHaveProperty("userId");
      expect(principal).not.toHaveProperty("expiresAtMs");
      expect(principal).not.toHaveProperty("refreshed");
      expect(principal).not.toHaveProperty("reason");
    });
  });

  describe("Successful Transformations", () => {
    it("should handle different roles correctly", () => {
      const adminInput = createTestAuthUserDto({ role: "ADMIN" });
      const userInput = createTestUpdateSessionDto({ role: "USER" });

      expect(toSessionPrincipal(adminInput).role).toBe("ADMIN");
      expect(toSessionPrincipal(userInput).role).toBe("USER");
    });

    it("should map userId to id field for session updates", () => {
      const input = createTestUpdateSessionDto({ userId: TEST_USER_ID });
      const principal = toSessionPrincipal(input);

      expect(principal.id).toBe(TEST_USER_ID);
      expect(principal).not.toHaveProperty("userId");
    });

    it("should preserve branded types in the output", () => {
      const input = createTestAuthUserDto();
      const principal = toSessionPrincipal(input);

      expect(principal.id).toBe(TEST_USER_ID);
      expect(typeof principal.id).toBe("string");
    });
  });

  describe("Consistency and Data Integrity", () => {
    it("should produce identical output for same user from different sources", () => {
      const authDto = createTestAuthUserDto({ id: TEST_USER_ID, role: "USER" });
      const updateDto = createTestUpdateSessionDto({
        role: "USER",
        userId: TEST_USER_ID,
      });

      const principal1 = toSessionPrincipal(authDto);
      const principal2 = toSessionPrincipal(updateDto);

      expect(principal1).toEqual(principal2);
    });

    it("should return a new object and not modify the original input", () => {
      const input = createTestAuthUserDto();
      const inputCopy = { ...input };

      const principal = toSessionPrincipal(input);
      // biome-ignore lint/suspicious/noExplicitAny: keep until a better solution
      (principal as any).role = "ADMIN";

      expect(principal).not.toBe(input);
      expect(input).toEqual(inputCopy);
      expect(input.role).toBe("USER");
    });
  });

  describe("Edge Cases", () => {
    it("should handle extreme field values", () => {
      const longId = toUserId("12345678-1234-1234-1234-123456789012");
      const input = createTestAuthUserDto({ id: longId });

      const principal = toSessionPrincipal(input);

      expect(principal.id).toBe(longId);
    });

    it("should handle minimum valid numeric values in session update", () => {
      const input = createTestUpdateSessionDto({ expiresAtMs: 0 });
      const principal = toSessionPrincipal(input);

      expect(principal.id).toBe(TEST_USER_ID);
    });
  });
});
