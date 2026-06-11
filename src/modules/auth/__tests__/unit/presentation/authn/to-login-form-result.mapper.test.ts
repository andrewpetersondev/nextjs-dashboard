import { describe, expect, it } from "vitest";
import { toLoginFormResult } from "@/modules/auth/presentation/authn/mappers/to-login-form-result.mapper";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Unit tests for toLoginFormResult.
 *
 * Security boundary: this mapper builds the client-visible FormResult for
 * failed logins. Only `LOGIN_ECHO_FIELDS_LIST` values may appear in
 * `metadata.formData`; the submitted password must never cross the
 * Server Action boundary (BACKLOG: "Stop echoing sensitive fields").
 */
describe("toLoginFormResult", () => {
	const submitted = {
		email: "user@example.com",
		password: "hunter2-secret",
	} as const;

	it("maps invalid_credentials to a unified response without echoing the password", () => {
		const error = makeAppError(APP_ERROR_KEYS.invalid_credentials, {
			cause: "",
			message: "Invalid credentials.",
			metadata: {},
		});

		const result = toLoginFormResult(error, submitted);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					formData: { email: "user@example.com" },
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

		const result = toLoginFormResult(error, submitted);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					formData: { email: "user@example.com" },
				}),
			);
			expect(JSON.stringify(result)).not.toContain("hunter2-secret");
		}
	});
});
