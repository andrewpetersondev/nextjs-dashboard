import {
	makeAuthenticatedUserDto,
	TEST_USER_ID,
} from "@test-support/fixtures/user.fixtures";
import { describe, expect, it } from "vitest";
import { toSessionPrincipal } from "@/modules/auth/application/shared/mappers/flows/login/to-session-principal.mapper";
import { toUserId } from "@/modules/users/domain/user-id.mappers";

/**
 * Unit tests for toSessionPrincipal mapper.
 *
 * This mapper extracts minimal data (id, role) for JWT claims, implementing
 * the principle of least privilege for session tokens.
 *
 * Transformation: AuthenticatedUserDto → SessionPrincipalDto
 * Layer: Application → Application
 * Security: Minimal data for JWT claims (only id and role)
 */
describe("toSessionPrincipal Mapper", () => {
	describe("Security Boundary - Principle of Least Privilege", () => {
		it("should strictly include only id and role from AuthenticatedUserDto", () => {
			const input = makeAuthenticatedUserDto({
				email: "sensitive@example.com",
				username: "sensitive_user",
			});

			const principal = toSessionPrincipal(input);

			expect(principal).toEqual({
				id: TEST_USER_ID,
				role: "USER",
			});

			expect(principal).not.toHaveProperty("email");
			expect(principal).not.toHaveProperty("username");

			// JSON serialization safety
			const json = JSON.stringify(principal);
			expect(json).not.toContain("sensitive@example.com");
			expect(json).not.toContain("sensitive_user");
		});
	});

	describe("Successful Transformations", () => {
		it("should handle different roles correctly", () => {
			expect(
				toSessionPrincipal(makeAuthenticatedUserDto({ role: "ADMIN" })).role,
			).toBe("ADMIN");
			expect(
				toSessionPrincipal(makeAuthenticatedUserDto({ role: "USER" })).role,
			).toBe("USER");
		});

		it("should preserve branded types in the output", () => {
			const input = makeAuthenticatedUserDto();
			const principal = toSessionPrincipal(input);

			expect(principal.id).toBe(TEST_USER_ID);
			expect(typeof principal.id).toBe("string");
		});
	});

	describe("Consistency and Data Integrity", () => {
		it("should return a new object and not modify the original input", () => {
			const input = makeAuthenticatedUserDto();
			const inputCopy = { ...input };

			const principal = toSessionPrincipal(input);
			(principal as { role: string }).role = "ADMIN";

			expect(principal).not.toBe(input);
			expect(input).toEqual(inputCopy);
			expect(input.role).toBe("USER");
		});
	});

	describe("Edge Cases", () => {
		it("should handle extreme field values", () => {
			const longId = toUserId("12345678-1234-1234-1234-123456789012");
			const input = makeAuthenticatedUserDto({ id: longId });

			const principal = toSessionPrincipal(input);

			expect(principal.id).toBe(longId);
		});
	});
});
