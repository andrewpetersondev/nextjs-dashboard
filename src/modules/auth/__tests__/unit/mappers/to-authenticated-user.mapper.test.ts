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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
describe("toAuthenticatedUserDto Mapper", () => {
  const createTestAuthUserEntity = (
    overrides: Partial<AuthUserEntity> = {},
  ): AuthUserEntity => ({
    email: "test@example.com",
    id: toUserId("550e8400-e29b-41d4-a716-446655440000"),
    password: toHash("$2a$10$hashedpassword"),
    role: "USER",
    username: "testuser",
    ...overrides,
  });

  describe("Security Boundary - Password Stripping", () => {
    it("should strictly strip password hash and only include safe fields", () => {
      // Arrange
      const entity = createTestAuthUserEntity();

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert: Password MUST NOT be present
      expect(dto).not.toHaveProperty("password");
      // @ts-expect-error - password should not exist on DTO type
      expect(dto.password).toBeUndefined();

      // Verify exact set of fields
      const dtoKeys = Object.keys(dto).sort();
      const expectedKeys = ["email", "id", "role", "username"].sort();
      expect(dtoKeys).toEqual(expectedKeys);

      // Verify JSON serialization safety
      const jsonString = JSON.stringify(dto);
      expect(jsonString).not.toContain("password");
      expect(jsonString).not.toContain("$2a$10$hashedpassword");
    });

    it("should handle entity with empty password hash correctly", () => {
      const entity = createTestAuthUserEntity({ password: toHash("") });
      const dto = toAuthenticatedUserDto(entity);
      expect(dto).not.toHaveProperty("password");
    });
  });

  describe("Successful Transformations", () => {
    it("should map all fields correctly with preserved branded types", () => {
      // Arrange
      const userId = toUserId("550e8400-e29b-41d4-a716-446655440003");
      const entity = createTestAuthUserEntity({
        email: "user+tag@example.com",
        id: userId,
        role: "ADMIN",
        username: "admin_user-123",
      });

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto).toEqual({
        email: "user+tag@example.com",
        id: userId,
        role: "ADMIN",
        username: "admin_user-123",
      });

      // Type checks
      expect(typeof dto.email).toBe("string");
      expect(typeof dto.id).toBe("string");
    });
  });

  describe("Data Integrity and Immutability", () => {
    it("should not modify the original entity and return a new object", () => {
      // Arrange
      const entity = createTestAuthUserEntity();
      const originalEmail = entity.email;

      // Act
      const dto = toAuthenticatedUserDto(entity);

      // Assert
      expect(dto).not.toBe(entity);
      expect(entity.email).toBe(originalEmail);
    });

    it("should have readonly properties at type level", () => {
      const entity = createTestAuthUserEntity();
      const dto = toAuthenticatedUserDto(entity);

      // @ts-expect-error - email is readonly
      dto.email = "modified@example.com";
      expect(dto.email).toBe("modified@example.com");
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum valid field lengths", () => {
      const entity = createTestAuthUserEntity({
        email: "a@b.c",
        username: "u",
      });
      const dto = toAuthenticatedUserDto(entity);
      expect(dto.email).toBe("a@b.c");
      expect(dto.username).toBe("u");
    });

    it("should handle extreme field lengths", () => {
      const longEmail = "a".repeat(100) + "@example.com";
      const longUsername = "u".repeat(50);
      const entity = createTestAuthUserEntity({
        email: longEmail,
        username: longUsername,
      });
      const dto = toAuthenticatedUserDto(entity);
      expect(dto.email).toBe(longEmail);
      expect(dto.username).toBe(longUsername);
    });
  });
});
