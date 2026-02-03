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
describe("toSessionPrincipal Mapper", () => {
  describe("Mapping from AuthenticatedUserDto", () => {
    it("should extract only id and role from authenticated user", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Only id and role should be included
      expect(principal).toEqual({
        id: "00000000-0000-0000-0000-000000000123",
        role: "USER",
      });
    });

    it("should strip email from session principal", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "sensitive@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000456"),
        role: "ADMIN",
        username: "adminuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Email should NOT be in principal
      expect(principal).not.toHaveProperty("email");
      expect(principal.email).toBeUndefined();
    });

    it("should strip username from session principal", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000789"),
        role: "USER",
        username: "sensitiveusername",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Username should NOT be in principal
      expect(principal).not.toHaveProperty("username");
      expect((principal as any).username).toBeUndefined();
    });

    it("should handle admin role correctly", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "admin@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000aaa"),
        role: "ADMIN",
        username: "adminuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert
      expect(principal.role).toBe("ADMIN");
    });

    it("should preserve branded UserId", () => {
      // Arrange
      const userId = toUserId("00000000-0000-0000-0000-000000000bbb");
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: userId,
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: ID should remain branded
      expect(principal.id).toBe("00000000-0000-0000-0000-000000000bbb");
    });
  });

  describe("Mapping from UpdateSessionSuccessDto", () => {
    it("should extract id and role from session update", () => {
      // Arrange
      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 1_700_000_000_000,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role: "USER",
        userId: toUserId("00000000-0000-0000-0000-000000000123"),
      };

      // Act
      const principal = toSessionPrincipal(sessionUpdate);

      // Assert
      expect(principal).toEqual({
        id: "00000000-0000-0000-0000-000000000123",
        role: "USER",
      });
    });

    it("should map userId to id field", () => {
      // Arrange
      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 1_700_000_000_000,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role: "ADMIN",
        userId: toUserId("00000000-0000-0000-0000-000000000aaa"),
      };

      // Act
      const principal = toSessionPrincipal(sessionUpdate);

      // Assert: userId should be mapped to id
      expect(principal.id).toBe("00000000-0000-0000-0000-000000000aaa");
      expect(principal).not.toHaveProperty("userId");
    });

    it("should handle admin role from session update", () => {
      // Arrange
      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 1_700_000_000_000,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role: "ADMIN",
        userId: toUserId("00000000-0000-0000-0000-000000000aaa"),
      };

      // Act
      const principal = toSessionPrincipal(sessionUpdate);

      // Assert
      expect(principal.role).toBe("ADMIN");
    });
  });

  describe("Security - Principle of Least Privilege", () => {
    it("should only include data needed for JWT claims", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Only id and role (minimal data for session)
      const principalKeys = Object.keys(principal);
      expect(principalKeys).toHaveLength(2);
      expect(principalKeys).toContain("id");
      expect(principalKeys).toContain("role");
    });

    it("should not leak email to JWT claims", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "sensitive.email@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);
      const jsonString = JSON.stringify(principal);

      // Assert: Email should not be in JWT
      expect(jsonString).not.toContain("email");
      expect(jsonString).not.toContain("sensitive.email@example.com");
    });

    it("should not leak username to JWT claims", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "sensitiveusername",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);
      const jsonString = JSON.stringify(principal);

      // Assert: Username should not be in JWT
      expect(jsonString).not.toContain("username");
      expect(jsonString).not.toContain("sensitiveusername");
    });

    it("should minimize JWT payload size", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "very.long.email.address@subdomain.example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "very_long_username_with_many_characters",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Principal should be smaller than original DTO
      const principalSize = JSON.stringify(principal).length;
      const dtoSize = JSON.stringify(authenticatedUser).length;
      expect(principalSize).toBeLessThan(dtoSize);
    });
  });

  describe("Data Integrity", () => {
    it("should not modify the original authenticated user", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };
      const originalEmail = authenticatedUser.email;
      const originalUsername = authenticatedUser.username;

      // Act
      const principal = toSessionPrincipal(authenticatedUser);
      (principal as any).role = "ADMIN"; // Modify principal

      // Assert: Original should be unchanged
      expect(authenticatedUser.email).toBe(originalEmail);
      expect(authenticatedUser.username).toBe(originalUsername);
      expect(authenticatedUser.role).toBe("USER");
    });

    it("should not modify the original session update", () => {
      // Arrange
      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 1_700_000_000_000,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role: "USER",
        userId: toUserId("00000000-0000-0000-0000-000000000123"),
      };
      const originalRole = sessionUpdate.role;

      // Act
      const principal = toSessionPrincipal(sessionUpdate);
      (principal as any).role = "ADMIN"; // Modify principal

      // Assert: Original should be unchanged
      expect(sessionUpdate.role).toBe(originalRole);
    });

    it("should create a new object (not reference original)", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Should be different objects
      expect(principal).not.toBe(authenticatedUser);
    });
  });

  describe("Type Discrimination", () => {
    it("should correctly identify AuthenticatedUserDto by email property", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert: Should use id from AuthenticatedUserDto
      expect(principal.id).toBe("00000000-0000-0000-0000-000000000123");
    });

    it("should correctly identify UpdateSessionSuccessDto by absence of email", () => {
      // Arrange
      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 1_700_000_000_000,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role: "USER",
        userId: toUserId("00000000-0000-0000-0000-000000000456"),
      };

      // Act
      const principal = toSessionPrincipal(sessionUpdate);

      // Assert: Should use userId from UpdateSessionSuccessDto
      expect(principal.id).toBe("00000000-0000-0000-0000-000000000456");
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum valid authenticated user", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "a@b.c",
        id: toUserId("00000000-0000-0000-0000-000000000001"),
        role: "USER",
        username: "u",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert
      expect(principal).toEqual({
        id: "00000000-0000-0000-0000-000000000001",
        role: "USER",
      });
    });

    it("should handle minimum valid session update", () => {
      // Arrange
      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 0,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role: "USER",
        userId: toUserId("00000000-0000-0000-0000-000000000001"),
      };

      // Act
      const principal = toSessionPrincipal(sessionUpdate);

      // Assert
      expect(principal).toEqual({
        id: "00000000-0000-0000-0000-000000000001",
        role: "USER",
      });
    });

    it("should handle long user IDs", () => {
      // Arrange
      const longId = "12345678-1234-1234-1234-123456789012";
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId(longId),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert
      expect(principal.id).toBe(longId);
    });
  });

  describe("Type Safety", () => {
    it("should have exactly 2 fields in principal", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert
      const principalKeys = Object.keys(principal);
      expect(principalKeys).toHaveLength(2);
    });

    it("should have correct types for all fields", () => {
      // Arrange
      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: toUserId("00000000-0000-0000-0000-000000000123"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const principal = toSessionPrincipal(authenticatedUser);

      // Assert
      expect(typeof principal.id).toBe("string");
      expect(typeof principal.role).toBe("string");
    });
  });

  describe("Consistency Between Input Types", () => {
    it("should produce identical output for same user from different sources", () => {
      // Arrange
      const userId = toUserId("00000000-0000-0000-0000-000000000123");
      const role = "USER";

      const authenticatedUser: AuthenticatedUserDto = {
        email: "test@example.com",
        id: userId,
        role,
        username: "testuser",
      };

      const sessionUpdate: UpdateSessionSuccessDto = {
        expiresAtMs: 1_700_000_000_000,
        reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
        refreshed: true,
        role,
        userId,
      };

      // Act
      const principalFromAuth = toSessionPrincipal(authenticatedUser);
      const principalFromUpdate = toSessionPrincipal(sessionUpdate);

      // Assert: Both should produce identical principals
      expect(principalFromAuth).toEqual(principalFromUpdate);
    });
  });
});
