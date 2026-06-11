import { describe, expect, it } from "vitest";
import { toSignupFormResult } from "@/modules/auth/presentation/authn/mappers/to-signup-form-result.mapper";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { PG_CODES } from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";

/**
 * Unit tests for toSignupFormResult.
 *
 * Security boundary: this mapper builds the client-visible FormResult for
 * failed signups. Only `SIGNUP_ECHO_FIELDS_LIST` values may appear in
 * `metadata.formData`; the submitted password must never cross the
 * Server Action boundary (BACKLOG: "Stop echoing sensitive fields").
 */
describe("toSignupFormResult", () => {
	const submitted = {
		email: "user@example.com",
		password: "hunter2-secret",
		username: "andrew",
	} as const;

	it("maps a unique violation to conflict field errors without echoing the password", () => {
		const error = makeAppError(APP_ERROR_KEYS.conflict, {
			cause: "",
			message: "duplicate key",
			metadata: {
				constraint: "users_email_unique",
				pgCode: PG_CODES.UNIQUE_VIOLATION,
			},
		});

		const result = toSignupFormResult(error, submitted);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.conflict);
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					fieldErrors: expect.objectContaining({
						email: ["alreadyInUse"],
					}),
					formData: { email: "user@example.com", username: "andrew" },
				}),
			);

			// JSON serialization safety: the DTO crossing the boundary carries
			// no trace of the password.
			expect(JSON.stringify(result)).not.toContain("hunter2-secret");
		}
	});

	it("redacts the echo on the generic error path too", () => {
		const error = makeAppError(APP_ERROR_KEYS.unexpected, {
			cause: "",
			message: "Something broke.",
			metadata: {},
		});

		const result = toSignupFormResult(error, submitted);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					formData: { email: "user@example.com", username: "andrew" },
				}),
			);
			expect(JSON.stringify(result)).not.toContain("hunter2-secret");
		}
	});
});
