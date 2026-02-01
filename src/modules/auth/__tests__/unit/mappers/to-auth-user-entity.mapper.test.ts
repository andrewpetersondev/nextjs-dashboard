import { describe, expect, it } from "vitest";
import { toAuthUserEntity } from "@/modules/auth/infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { UserRow } from "@/server/db/schema";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Unit tests for toAuthUserEntity mapper.
 *
 * This mapper transforms database rows (UserRow) to domain entities (AuthUserEntity).
 * It's a critical security boundary that includes password hashes.
 *
 * Transformation: UserRow → AuthUserEntity
 * Layer: Infrastructure → Domain
 */
describe("toAuthUserEntity Mapper", () => {
  describe("Successful Transformations", () => {
    it("should map a valid user row to AuthUserEntity", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("550e8400-e29b-41d4-a716-446655440000"),
        password: toHash("$2a$10$hashedpassword"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert
      expect(entity).toEqual({
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("550e8400-e29b-41d4-a716-446655440000"), // Branded as UserId
        password: toHash("$2a$10$hashedpassword"), // Branded as Hash
        role: "user",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      });
    });

    it("should handle admin role correctly", () => {
      // Arrange
      const userRow: UserRow = {
        email: "admin@example.com",
        emailVerified: null,
        id: toUserId("660e8400-e29b-41d4-a716-446655440001"),
        password: toHash("$2a$10$adminhashedpassword"),
        role: "ADMIN",
        sensitiveData: "cantTouchThis",
        username: "adminuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert
      expect(entity.role).toBe("admin");
    });

    it("should preserve password hash (security requirement)", () => {
      // Arrange
      const passwordHash = "$2a$10$verylonghashstring";
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("770e8400-e29b-41d4-a716-446655440002"),
        password: toHash(passwordHash),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: Password hash must be preserved for authentication
      expect(entity.password).toBe(toHash(passwordHash));
    });

    it("should convert id to branded UserId type", () => {
      // Arrange
      const userId = "880e8400-e29b-41d4-a716-446655440003";
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId(userId),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: ID should be branded (type-level check, runtime same value)
      expect(entity.id).toBe(toUserId(userId));
      expect(typeof entity.id).toBe("string");
    });
  });

  describe("Edge Cases", () => {
    it("should handle email with special characters", () => {
      // Arrange
      const userRow: UserRow = {
        email: "user+tag@sub.example.com",
        emailVerified: null,
        id: toUserId("990e8400-e29b-41d4-a716-446655440004"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "specialuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert
      expect(entity.email).toBe("user+tag@sub.example.com");
    });

    it("should handle username with numbers and underscores", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("aa0e8400-e29b-41d4-a716-446655440005"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "test_user_123",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert
      expect(entity.username).toBe("test_user_123");
    });

    it("should not include createdAt in entity (not needed for auth)", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("bb0e8400-e29b-41d4-a716-446655440006"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: createdAt should not be in the entity
      expect(entity).not.toHaveProperty("createdAt");
    });
  });

  describe("Data Integrity", () => {
    it("should not modify the original user row", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("cc0e8400-e29b-41d4-a716-446655440007"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };
      const originalEmail = userRow.email;
      const originalId = userRow.id;

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: Original row should be unchanged (entity is a new object)
      expect(userRow.email).toBe(originalEmail);
      expect(userRow.id).toBe(originalId);
    });

    it("should create a new object (not reference original)", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("dd0e8400-e29b-41d4-a716-446655440008"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: Should be different objects
      expect(entity).not.toBe(userRow);
    });
  });

  describe("Security Considerations", () => {
    it("should include password hash (required for authentication)", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("ee0e8400-e29b-41d4-a716-446655440009"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: Password must be present for authentication
      expect(entity.password).toBeDefined();
      expect(entity.password).toBe(toHash("$2a$10$hash"));
    });

    it("should map all required fields for authentication", () => {
      // Arrange
      const userRow: UserRow = {
        email: "test@example.com",
        emailVerified: null,
        id: toUserId("ff0e8400-e29b-41d4-a716-446655440010"),
        password: toHash("$2a$10$hash"),
        role: "USER",
        sensitiveData: "cantTouchThis",
        username: "testuser",
      };

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert: All auth-required fields must be present
      expect(entity.id).toBeDefined();
      expect(entity.email).toBeDefined();
      expect(entity.username).toBeDefined();
      expect(entity.password).toBeDefined();
      expect(entity.role).toBeDefined();
    });
  });
});
