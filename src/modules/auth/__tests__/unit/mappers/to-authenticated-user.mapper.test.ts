import { makeAuthUserEntity } from "@test-support/fixtures/user.fixtures";
import { describe, expect, it } from "vitest";
import { toAuthenticatedUserDto } from "@/modules/auth/application/shared/mappers/flows/login/to-authenticated-user.mapper";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { toHash } from "@/server/crypto/hashing/hashing.value";

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
		it("should strictly strip password hash and only include safe fields", () => {
			const entity = makeAuthUserEntity();

			const dto = toAuthenticatedUserDto(entity);

			// Password MUST NOT be present
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
			const entity = makeAuthUserEntity({ password: toHash("") });
			const dto = toAuthenticatedUserDto(entity);
			expect(dto).not.toHaveProperty("password");
		});
	});

	describe("Successful Transformations", () => {
		it("should map all fields correctly with preserved branded types", () => {
			const userId = toUserId("550e8400-e29b-41d4-a716-446655440003");
			const entity = makeAuthUserEntity({
				email: "user+tag@example.com",
				id: userId,
				role: "ADMIN",
				username: "admin_user-123",
			});

			const dto = toAuthenticatedUserDto(entity);

			expect(dto).toEqual({
				email: "user+tag@example.com",
				id: userId,
				role: "ADMIN",
				username: "admin_user-123",
			});

			expect(typeof dto.email).toBe("string");
			expect(typeof dto.id).toBe("string");
		});
	});

	describe("Data Integrity and Immutability", () => {
		it("should not modify the original entity and return a new object", () => {
			const entity = makeAuthUserEntity();
			const originalEmail = entity.email;

			const dto = toAuthenticatedUserDto(entity);

			expect(dto).not.toBe(entity);
			expect(entity.email).toBe(originalEmail);
		});

		it("should have readonly properties at type level", () => {
			const entity = makeAuthUserEntity();
			const dto = toAuthenticatedUserDto(entity);

			// @ts-expect-error - email is readonly
			dto.email = "modified@example.com";
			expect(dto.email).toBe("modified@example.com");
		});
	});

	describe("Edge Cases", () => {
		it("should handle minimum valid field lengths", () => {
			const entity = makeAuthUserEntity({
				email: "a@b.c",
				username: "u",
			});
			const dto = toAuthenticatedUserDto(entity);
			expect(dto.email).toBe("a@b.c");
			expect(dto.username).toBe("u");
		});

		it("should handle extreme field lengths", () => {
			const longEmail = `${"a".repeat(100)}@example.com`;
			const longUsername = "u".repeat(50);
			const entity = makeAuthUserEntity({
				email: longEmail,
				username: longUsername,
			});
			const dto = toAuthenticatedUserDto(entity);
			expect(dto.email).toBe(longEmail);
			expect(dto.username).toBe(longUsername);
		});
	});
});
