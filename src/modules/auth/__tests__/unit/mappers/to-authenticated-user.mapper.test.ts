import { describe, expect, it } from "vitest";
import { toAuthenticatedUserDto } from "@/modules/auth/application/shared/mappers/flows/login/to-authenticated-user.mapper";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Unit tests for toAuthenticatedUserDto mapper.
 *
 * This mapper is a CRITICAL SECURITY BOUNDARY that strips password hashes
 * when transforming from domain entities to application DTOs.
 *
 * Transformation: AuthUserEntity → AuthenticatedUserDto
 * Layer: Domain → Application
 * Security: Removes password hash (security boundary)
 */
describe("toAuthenticatedUserDto Mapper", () => {
  describe("Security Boundary - Password Stripping", () => {
    it("should strip password hash from entity", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hashedpassword"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: Password MUST NOT be present in DTO
      expect(dto).not.toHaveProperty("password");
      expect((dto as any).password).toBeUndefined();
    });

    it("should never leak password hash to application layer", () => {
      // Arrange
      const sensitivePassword = toHash("$2a$10$verysensitivehash");
      const entity: AuthUserEntity = {
        email: "admin@example.com",
        id: toUserId("user_admin"),
        password: sensitivePassword,
        role: "ADMIN",
        username: "adminuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: Verify password is completely removed
      const dtoKeys = Object.keys(dto);
      expect(dtoKeys).not.toContain("password");

      // Verify DTO only contains safe fields
      expect(dtoKeys).toEqual(["email", "id", "role", "username"]);
    });

    it("should handle entity with empty password hash", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash(""),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: Even empty password should be stripped
      expect(dto).not.toHaveProperty("password");
    });
  });

  describe("Successful Transformations", () => {
    it("should map all safe fields correctly", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto).toEqual({
        email: "test@example.com",
        id: "user_123",
        role: "USER",
        username: "testuser",
      });
    });

    it("should preserve user role", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "admin@example.com",
        id: toUserId("user_admin"),
        password: toHash("$2a$10$hash"),
        role: "ADMIN",
        username: "adminuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto.role).toBe("admin");
    });

    it("should preserve branded UserId", () => {
      // Arrange
      const userId = toUserId("user_branded_123");
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: userId,
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: ID should remain branded
      expect(dto.id).toBe("user_branded_123");
    });

    it("should handle email with special characters", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "user+tag@sub.example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto.email).toBe("user+tag@sub.example.com");
    });

    it("should handle username with special characters", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "test_user-123",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto.username).toBe("test_user-123");
    });
  });

  describe("Data Integrity", () => {
    it("should not modify the original entity", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };
      const originalEmail = entity.email;
      const originalPassword = entity.password;

      // Act
      const dto = toAuthenticatedUserDto(entity);
      dto.email = "modified@example.com";

      // Assert: Original entity should be unchanged
      expect(entity.email).toBe(originalEmail);
      expect(entity.password).toBe(originalPassword);
    });

    it("should create a new object (not reference original)", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: Should be different objects
      expect(dto).not.toBe(entity);
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum valid entity", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "a@b.c",
        id: toUserId("1"),
        password: toHash("x"),
        role: "USER",
        username: "u",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto).toEqual({
        email: "a@b.c",
        id: "1",
        role: "USER",
        username: "u",
      });
      expect(dto).not.toHaveProperty("password");
    });

    it("should handle long email addresses", () => {
      // Arrange
      const longEmail =
        "very.long.email.address.with.many.dots@subdomain.example.com";
      const entity: AuthUserEntity = {
        email: longEmail,
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto.email).toBe(longEmail);
    });

    it("should handle long usernames", () => {
      // Arrange
      const longUsername = "very_long_username_with_many_characters_123";
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: longUsername,
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto.username).toBe(longUsername);
    });
  });

  describe("Type Safety", () => {
    it("should only include expected fields in DTO", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: DTO should have exactly 4 fields
      const dtoKeys = Object.keys(dto);
      expect(dtoKeys).toHaveLength(4);
      expect(dtoKeys).toContain("email");
      expect(dtoKeys).toContain("id");
      expect(dtoKeys).toContain("role");
      expect(dtoKeys).toContain("username");
    });

    it("should have correct types for all fields", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(typeof dto.email).toBe("string");
      expect(typeof dto.id).toBe("string");
      expect(typeof dto.role).toBe("string");
      expect(typeof dto.username).toBe("string");
    });
  });

  describe("Security Compliance", () => {
    it("should comply with principle of least privilege", () => {
      // Arrange: Entity has sensitive password
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$sensitivehash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: DTO should only contain data needed by application layer
      // Password is NOT needed after authentication succeeds
      expect(dto).toEqual({
        email: "test@example.com",
        id: "user_123",
        role: "USER",
        username: "testuser",
      });
    });

    it("should prevent accidental password exposure in JSON serialization", () => {
      // Arrange
      const entity: AuthUserEntity = {
        email: "test@example.com",
        id: toUserId("user_123"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        username: "testuser",
      };

      // Act
      const dto = toAuthenticatedUserDto(entity);
      const jsonString = JSON.stringify(dto);

      // Assert: JSON should not contain password
      expect(jsonString).not.toContain("password");
      expect(jsonString).not.toContain("$2a$10$hash");
    });
  });
});
