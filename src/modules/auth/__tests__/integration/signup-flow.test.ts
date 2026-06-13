import { users } from "@database/schema/users";
import { buildFormData } from "@test-support/forms/form-data";
import { runAndCaptureRedirectPath } from "@test-support/next-redirect";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { signupAction } from "@/modules/auth/presentation/authn/actions/signup.action";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { toFormErrorPayload } from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

/**
 * Integration tests for the complete signup flow.
 */
describe("Signup Flow Integration", () => {
	const TEST_EMAIL = "signup-test@example.com";
	const TEST_PASSWORD = "TestPassword123!";
	const TEST_USERNAME = "signuptestuser";
	const FAIL_EMAIL = "fail-test@example.com";

	const signupForm = (
		email = TEST_EMAIL,
		password = TEST_PASSWORD,
		username = TEST_USERNAME,
	): FormData => buildFormData({ email, password, username });

	afterEach(async () => {
		const db = getAppDb();
		await db.delete(users).where(eq(users.email, TEST_EMAIL));
		await db.delete(users).where(eq(users.email, FAIL_EMAIL));
		vi.clearAllMocks();
	});

	describe("Successful Signup", () => {
		it("should complete full signup flow, create user in DB, and redirect", async () => {
			const redirectedTo = await runAndCaptureRedirectPath(
				signupAction({} as FormResult<unknown>, signupForm()),
			);
			expect(redirectedTo).toBe("/dashboard");

			const db = getAppDb();
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.email, TEST_EMAIL))
				.limit(1);

			expect(user).toBeDefined();
			expect(user?.username).toBe(TEST_USERNAME);
			expect(user?.role).toBe("USER");

			const { revalidatePath } = await import("next/cache");
			expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
		});
	});

	describe("Signup Errors", () => {
		it("should return validation errors for invalid input", async () => {
			const result = await signupAction(
				{} as FormResult<unknown>,
				signupForm("not-an-email", "short", ""),
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = toFormErrorPayload<SignupField>(result.error);
				expect(payload.fieldErrors?.email).toBeDefined();
				expect(payload.fieldErrors?.password).toBeDefined();
				expect(payload.fieldErrors?.username).toBeDefined();
			}
		});

		it("should handle email conflicts (already exists)", async () => {
			// 1. Create a user first
			const db = getAppDb();
			await db.insert(users).values({
				email: TEST_EMAIL,
				password: toHash("hashed_password"),
				role: "USER",
				username: "existing_user",
			});

			// 2. Try to signup with the same email
			const result = await signupAction(
				{} as FormResult<unknown>,
				signupForm(),
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = toFormErrorPayload<SignupField>(result.error);
				// Server Action contract: conflicts must return field-level errors.
				expect(payload.fieldErrors?.email).toBeDefined();
				expect(payload.fieldErrors.email.length).toBeGreaterThan(0);
				expect(payload.fieldErrors.email[0]?.toLowerCase()).toMatch(
					/already|use|exists|unique|conflict/,
				);

				// Boundary hygiene: the conflict DTO must not leak Postgres
				// internals (raw detail string, table/schema/constraint names).
				// The metadata carries exactly the form-relevant fields.
				expect(Object.keys(result.error.metadata).sort()).toEqual([
					"fieldErrors",
					"formData",
					"formErrors",
					"pgCode",
				]);
				expect(JSON.stringify(result.error)).not.toContain("already exists.");
			}
		});

		it("should handle database failures during signup gracefully", async () => {
			// Use a unique email to avoid conflicts if a previous test failed to clean up.
			const formData = signupForm(FAIL_EMAIL);

			// Mock the database insert on the prototype to ensure it's caught.
			const { PgDatabase } = await import("drizzle-orm/pg-core");
			const insertSpy = vi
				.spyOn(PgDatabase.prototype, "insert")
				.mockImplementation(() => {
					throw new Error("Database insert failed");
				});

			const result = await signupAction({} as FormResult<unknown>, formData);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = toFormErrorPayload<SignupField>(result.error);
				expect(payload.formErrors).toBeDefined();
				expect(payload.formErrors.length).toBeGreaterThan(0);
				// We accept a pg unique violation too, in case state is polluted from a
				// failed cleanup, but it SHOULD be the error we threw.
				const firstFormError = payload.formErrors[0];
				expect(firstFormError).toBeDefined();
				expect(firstFormError?.toLowerCase()).toMatch(
					/database insert failed|unexpected|error|unique|conflict/,
				);
			}

			insertSpy.mockRestore();
		});
	});
});
