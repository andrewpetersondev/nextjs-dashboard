import { makeUserRow } from "@test-support/fixtures/user.fixtures";
import { describe, expect, it } from "vitest";
import { toAuthUserEntity } from "@/modules/auth/infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { toHash } from "@/server/crypto/hashing/hashing.value";

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
		it("should map a valid user row to AuthUserEntity with branded types", () => {
			const userRow = makeUserRow();

			const entity = toAuthUserEntity(userRow);

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
			const adminRow = makeUserRow({ role: "ADMIN" });
			const userRow = makeUserRow({ role: "USER" });

			expect(toAuthUserEntity(adminRow).role).toBe("ADMIN");
			expect(toAuthUserEntity(userRow).role).toBe("USER");
		});
	});

	describe("Security and Data Integrity", () => {
		it("should only include auth-related fields and strip database-specific ones", () => {
			const userRow = makeUserRow();

			const entity = toAuthUserEntity(userRow);

			const expectedKeys = ["email", "id", "password", "role", "username"];
			expect(Object.keys(entity).sort()).toEqual(expectedKeys.sort());
			expect(entity).not.toHaveProperty("sensitiveData");
			expect(entity).not.toHaveProperty("emailVerified");
		});

		it("should preserve the exact password hash string (branded as Hash)", () => {
			const passwordHash = "$2a$10$verylonghashstring";
			const userRow = makeUserRow({ password: toHash(passwordHash) });

			const entity = toAuthUserEntity(userRow);

			expect(entity.password).toBe(toHash(passwordHash));
		});

		it("should not modify the original input object", () => {
			const userRow = makeUserRow();
			const rowCopy = { ...userRow };

			toAuthUserEntity(userRow);

			expect(userRow).toEqual(rowCopy);
		});
	});

	describe("Edge Cases", () => {
		it("should handle special characters in email and username", () => {
			const userRow = makeUserRow({
				email: "user+tag@sub.example.com",
				username: "test_user.123",
			});

			const entity = toAuthUserEntity(userRow);

			expect(entity.email).toBe("user+tag@sub.example.com");
			expect(entity.username).toBe("test_user.123");
		});
	});
});
