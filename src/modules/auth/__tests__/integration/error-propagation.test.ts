import { buildFormData } from "@test-support/forms/form-data";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/modules/auth/presentation/authn/actions/login.action";
import { signupAction } from "@/modules/auth/presentation/authn/actions/signup.action";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { formErrorPayloadMapper } from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

describe("Auth Error Propagation Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const authForm = (
		email = "test@example.com",
		password = "Password123!",
	): FormData => buildFormData({ email, password, username: "testuser" });

	describe("Database Errors", () => {
		it("should propagate DB connection failure during login as a form-level error", async () => {
			const db = getAppDb();
			const originalSelect = db.select;
			vi.spyOn(db, "select").mockImplementationOnce(() => {
				throw new Error("Connection refused");
			});

			const result = await loginAction({} as FormResult<unknown>, authForm());

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = formErrorPayloadMapper(result.error);
				expect(payload.formErrors.length).toBeGreaterThan(0);
				// It's wrapped in safeExecute which maps to 'unexpected'
				expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
			}
			db.select = originalSelect;
		});

		it("should propagate DB constraint violation during signup as a conflict error", async () => {
			const db = getAppDb();
			const originalInsert = db.insert;

			// A Postgres unique violation (code 23505)
			const pgError = new Error(
				"duplicate key value violates unique constraint",
			);
			// biome-ignore lint/suspicious/noExplicitAny: augmenting a native Error with pg fields
			(pgError as any).code = "23505";
			// biome-ignore lint/suspicious/noExplicitAny: augmenting a native Error with pg fields
			(pgError as any).constraint = "users_email_unique";

			vi.spyOn(db, "insert").mockImplementationOnce(() => {
				throw pgError;
			});

			const result = await signupAction({} as FormResult<unknown>, authForm());

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe(APP_ERROR_KEYS.conflict);
				const payload = formErrorPayloadMapper(result.error);
				expect(payload.formErrors.length).toBeGreaterThan(0);
				const firstFormError = payload.formErrors[0];
				expect(firstFormError).toBeDefined();
				expect(firstFormError?.toLowerCase()).toMatch(
					/already in use|exists|conflict|unique/,
				);
			}
			db.insert = originalInsert;
		});
	});

	describe("Infrastructure Service Errors", () => {
		it("should handle hashing failure during signup gracefully", async () => {
			// The hasher is injected via makeAuthComposition, so mock the module.
			const { BcryptPasswordService } = await import(
				"@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
			);
			vi.spyOn(BcryptPasswordService.prototype, "hash").mockRejectedValueOnce(
				new Error("CPU exhausted"),
			);

			const result = await signupAction({} as FormResult<unknown>, authForm());

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
				const payload = formErrorPayloadMapper(result.error);
				// Message may be 'CPU exhausted' or a wrapped variant.
				expect(payload.message.toLowerCase()).toMatch(
					/failed|exhausted|unexpected/,
				);
			}
		});

		it("should handle JWT signing failure during login gracefully", async () => {
			const { JoseSessionJwtCryptoService } = await import(
				"@/modules/auth/infrastructure/session/services/jose-session-jwt-crypto.service"
			);
			vi.spyOn(
				JoseSessionJwtCryptoService.prototype,
				"sign",
			).mockRejectedValueOnce(new Error("Keystore unavailable"));

			// Ensure user is found so it proceeds to session establishment.
			const db = getAppDb();
			const originalSelect = db.select;
			vi.spyOn(db, "select").mockReturnValue({
				from: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue([
					{
						email: "test@example.com",
						id: "12345678-1234-4234-a234-123456789012",
						password: "hashed_password",
						role: "USER",
						username: "testuser",
					},
				]),
				where: vi.fn().mockReturnThis(),
				// biome-ignore lint/suspicious/noExplicitAny: partial drizzle query-builder stub
			} as any);

			const { BcryptPasswordService } = await import(
				"@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
			);
			vi.spyOn(BcryptPasswordService.prototype, "compare").mockResolvedValue({
				ok: true,
				value: true,
				// biome-ignore lint/suspicious/noExplicitAny: minimal Result stub
			} as any);

			const result = await loginAction({} as FormResult<unknown>, authForm());

			expect(result.ok).toBe(false);
			if (!result.ok) {
				const payload = formErrorPayloadMapper(result.error);
				expect(payload.message).toContain("unexpected error occurred");
			}

			db.select = originalSelect;
		});
	});
});
