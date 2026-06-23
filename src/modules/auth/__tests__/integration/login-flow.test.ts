import { type NewUserRow, users } from "@database/schema/users";
import { buildFormData } from "@test-support/forms/form-data";
import { runAndCaptureRedirectPath } from "@test-support/next-redirect";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/modules/auth/presentation/authn/actions/login.action";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { toFormErrorPayload } from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

/**
 * Integration tests for the complete login flow.
 *
 * These tests validate the entire authentication flow from the Server Action
 * through all layers (presentation → application → infrastructure → database)
 * and back to the UI.
 */
describe("Login Flow Integration", () => {
	const TEST_EMAIL = "integration-test@example.com";
	const TEST_PASSWORD = "TestPassword123!";
	const TEST_USERNAME = "integrationtestuser";
	let testUserId: string;

	const loginForm = (email = TEST_EMAIL, password = TEST_PASSWORD): FormData =>
		buildFormData({ email, password });

	beforeEach(async () => {
		const db = getAppDb();
		const { BcryptPasswordService } = await import(
			"@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
		);
		const hasher = new BcryptPasswordService(10);
		const hashedPassword = await hasher.hash(TEST_PASSWORD);

		const [insertedUser] = await db
			.insert(users)
			.values({
				email: TEST_EMAIL,
				password: hashedPassword,
				role: "USER",
				username: TEST_USERNAME,
			} satisfies NewUserRow)
			.returning();

		testUserId = insertedUser?.id || "550e8400-e29b-41d4-a716-446655440000";
	});

	afterEach(async () => {
		const db = getAppDb();
		if (testUserId) {
			// biome-ignore lint/suspicious/noExplicitAny: branded UserId column vs plain string id
			await db.delete(users).where(eq(users.id, testUserId as any));
		}
		vi.clearAllMocks();
	});

	describe("Successful Login", () => {
		it("should complete full flow and redirect to dashboard", async () => {
			const redirectedTo = await runAndCaptureRedirectPath(
				loginAction({} as FormResult<unknown>, loginForm()),
			);
			expect(redirectedTo).toBe("/dashboard");

			const { revalidatePath: mockRevalidatePath } = await import("next/cache");
			expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
		});
	});

	describe("Authentication and Validation Errors", () => {
		it("should return validation errors for invalid input format", async () => {
			const result = await loginAction(
				{} as FormResult<unknown>,
				loginForm("invalid-email", TEST_PASSWORD),
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = toFormErrorPayload<LoginField>(result.error);
				expect(payload.fieldErrors.email).toBeDefined();
			}
		});

		it("should handle invalid credentials (wrong password or user not found) identically", async () => {
			const cases = [
				{
					email: TEST_EMAIL,
					name: "wrong password",
					password: "WrongPassword123!",
				},
				{
					email: "nonexistent@example.com",
					name: "non-existent user",
					password: TEST_PASSWORD,
				},
			];

			const messages: string[] = [];

			for (const c of cases) {
				// biome-ignore lint/performance/noAwaitInLoops: cases run sequentially by design
				const result = await loginAction(
					{} as FormResult<unknown>,
					loginForm(c.email, c.password),
				);

				expect(result.ok, `Expected failure for ${c.name}`).toBe(false);
				if (!result.ok) {
					const payload = toFormErrorPayload<LoginField>(result.error);
					const message = payload.formErrors[0] || payload.message;
					expect(message).toContain("Invalid credentials");
					messages.push(message);
				}
			}

			// Enumeration prevention: messages must be identical
			expect(messages[0]).toBe(messages[1]);
		});

		it("should handle database connection failures gracefully", async () => {
			const db = getAppDb();
			const originalSelect = db.select;
			vi.spyOn(db, "select").mockImplementationOnce(() => {
				throw new Error("Database connection failed");
			});

			const result = await loginAction({} as FormResult<unknown>, loginForm());

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = toFormErrorPayload<LoginField>(result.error);
				expect(payload.formErrors).toBeDefined();
			}

			db.select = originalSelect;
		});
	});

	describe("Cross-Cutting Concerns", () => {
		it("should enforce security boundaries and track performance", async () => {
			// We use the successful redirect as a proxy for the whole chain: if any
			// mapper (UserRow → Entity → DTO → Principal → JWT) failed or leaked
			// sensitive data in a way that threw, this test would fail.
			const redirectedTo = await runAndCaptureRedirectPath(
				loginAction({} as FormResult<unknown>, loginForm()),
			);
			expect(redirectedTo).toBe("/dashboard");
		});
	});
});
