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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
describe("toAuthUserEntity Mapper", () => {
  const createTestUserRow = (overrides: Partial<UserRow> = {}): UserRow => ({
    email: "test@example.com",
    emailVerified: null,
    id: "550e8400-e29b-41d4-a716-446655440000",
    password: "$2a$10$hashedpassword",
    role: "USER",
    sensitiveData: "cantTouchThis",
    username: "testuser",
    ...overrides,
  });

  describe("Successful Transformations", () => {
    it("should map a valid user row to AuthUserEntity with branded types", () => {
      // Arrange
      const userRow = createTestUserRow();

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert
      expect(entity).toEqual({
        email: userRow.email,
        id: toUserId(userRow.id),
        password: toHash(userRow.password),
        role: userRow.role,
        username: userRow.username,
      });

      // Branded type runtime check
      expect(typeof entity.id).toBe("string");
      expect(typeof entity.password).toBe("string");
    });

    it("should correctly parse and map different user roles", () => {
      const adminRow = createTestUserRow({ role: "ADMIN" });
      const userRow = createTestUserRow({ role: "USER" });

      expect(toAuthUserEntity(adminRow).role).toBe("ADMIN");
      expect(toAuthUserEntity(userRow).role).toBe("USER");
    });
  });

  describe("Security and Data Integrity", () => {
    it("should only include auth-related fields and strip database-specific ones", () => {
      // Arrange
      const userRow = createTestUserRow();

      // Act
      const entity = toAuthUserEntity(userRow);

      // Assert
      const expectedKeys = ["email", "id", "password", "role", "username"];
      expect(Object.keys(entity).sort()).toEqual(expectedKeys.sort());
      expect(entity).not.toHaveProperty("sensitiveData");
      expect(entity).not.toHaveProperty("emailVerified");
    });

    it("should preserve the exact password hash string (branded as Hash)", () => {
      const passwordHash = "$2a$10$verylonghashstring";
      const userRow = createTestUserRow({ password: passwordHash });

      const entity = toAuthUserEntity(userRow);

      expect(entity.password).toBe(toHash(passwordHash));
    });

    it("should not modify the original input object", () => {
      const userRow = createTestUserRow();
      const rowCopy = { ...userRow };

      toAuthUserEntity(userRow);

      expect(userRow).toEqual(rowCopy);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in email and username", () => {
      const userRow = createTestUserRow({
        email: "user+tag@sub.example.com",
        username: "test_user.123",
      });

      const entity = toAuthUserEntity(userRow);

      expect(entity.email).toBe("user+tag@sub.example.com");
      expect(entity.username).toBe("test_user.123");
    });
  });
});
